<template>
  <v-container fluid>
    <v-row class="mb-3">
      <v-col cols="12" class="text-start">
        <h2>รายชื่อผู้ใช้งาน</h2>
      </v-col>
    </v-row>
    <div class="text-end">
      <v-btn color="blue-grey" class="mb-3" @click="addUser"
        >เพิ่มผู้ใช้งาน</v-btn
      >
    </div>
    <v-table v-if="userItems.length > 0" dense class="elevation-1">
      <thead class="table">
        <tr>
          <th class="text-left"><span class="text-color">Name</span></th>
          <th class="text-left"><span class="text-color">Username</span></th>
          <th class="text-left"><span class="text-color">Email</span></th>
          <th class="text-left"></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, index) in userItems.slice(
            (page - 1) * itemsPerPage,
            page * itemsPerPage
          )"
          :key="index"
        >
          <td class="mt-2">{{ item.name }}</td>
          <td class="mt-2">{{ item.username }}</td>
          <td class="mt-2">{{ item.email }}</td>

          <td class="d-flex justify-center mt-2">
            <v-btn variant="flat" class="mr-3 btn-edit" @click="editUser(item)"
              >แก้ไข</v-btn
            >
            <v-btn
              variant="flat"
              color="error"
              class="mr-3"
              @click="
                showConfirm = true;
                selectedUser = item;
              "
              >ลบ</v-btn
            >
          </td>
        </tr>
      </tbody>
    </v-table>
    <v-row v-else>
      <v-divider class="mt-3 mb-6"></v-divider>
      <v-col cols="12">
        <div class="d-flex justify-center">
          <img
            :src="'http://localhost:3000/uploads/notfoundicon.png'"
            width="200"
            height="200"
          />
        </div>
        <div class="text-noRequest text-center">
          <p>ขออภัยด้วยนะครับ</p>
        </div>
        <div class="text-center mt-3">
          <p class="text-muted">ไม่พบข้อมูลในหัวข้อที่คุณกำลังชมค่ะ</p>
        </div>
      </v-col>
    </v-row>
    <v-row v-if="userItems.length > 0" class="mt-12">
      <v-col cols="12" class="pa-0">
        <v-pagination
          class="text-pagination"
          v-model="page"
          :length="pages"
          circle
        ></v-pagination>
      </v-col>
    </v-row>

    <v-dialog
      v-model="showConfirm"
      persistent
      :center="true"
      max-width="500"
      :padding="20"
    >
      <v-card>
        <v-card-title class="headline text-center">ยืนยันการลบ</v-card-title>
        <v-card-text class="text-center">
          คุณต้องการลบผู้ใช้ {{ selectedUser.name }} ใช่หรือไม่?
        </v-card-text>
        <v-card-actions class="text-center">
          <v-btn
            class="btn-confirm"
            @click="
              deleteUser(selectedUser);
              showConfirm = false;
            "
          >
            ลบ
          </v-btn>
          <v-btn class="btn-cancel"  @click="showConfirm = false">
            ยกเลิก
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import api from "@/services/api";
import io from "socket.io-client";
import router from "@/router";

export default {
  data() {
    return {
      userItems: [],
      selectedUser: {},
      page: 1,
      itemsPerPage: 10,
      showForm: false,
      showConfirm: false,
      socket: null,
      socketioURL: "http://localhost:3000",
    };
  },
  methods: {
    addUser() {
      router.push(`/newusertable`).then(() => {
        window.scrollTo(0, 0);
      });
    },
    getId() {
      return this.$store.getters["authAdmin/getId"];
    },
    async deleteUser(user) {
      await api.delete("/users/" + user._id + "/" + this.getId());
      this.showAlert();
      this.fetchApi();
    },
    editUser(user) {
      router.push(`/usertable/${user._id}`).then(() => {
        window.scrollTo(0, 0);
      });
    },
    updateUser(updatedUser) {
      api.put("/users/" + updatedUser._id, updatedUser).then((result) => {
        this.userItems = result.data;
        this.fetchApi();
      });
      this.showForm = false;
    },
    async fetchApi() {
      try {
        const result = await api.get("/users/");
        this.userItems.splice(0, this.userItems.length);
        for (let i = 0; i < result.data.length; i++) {
          let isAdmin = false;
          for (let j = 0; j < result.data[i].roles.length; j++) {
            if (
              result.data[i].roles[j] === "ADMIN" ||
              result.data[i].roles[j] === "LOCAL_ADMIN"
            ) {
              isAdmin = true;
              break;
            }
          }
          if (!isAdmin) {
            this.userItems.push(result.data[i]);
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    showAlert() {
      this.$swal({
        scrollbarPadding: false,
        confirmButtonColor: "#00af70",
        customClass: "show-modal",
        text: "ลบผู้ใช้งานสำเร็จ",
        icon: "success",
        allowOutsideClick: false,
        confirmButtonText: "OK",
      });
    },
  },
  computed: {
    pages() {
      return Math.ceil(this.userItems.length / this.itemsPerPage);
    },
    isLogin() {
      return this.$store.getters["authAdmin/isLogin"];
    },
  },
  async mounted() {
    if (!this.isLogin) {
      router.push("/login").then(() => {
        window.scrollTo(0, 0);
      });
    } else if(this.isLogin){
      const res = await api.get("/checkRoles/" + this.getId());
      if(!res.data.user.roles.includes("ADMIN")){
        router.push("/login").then(() => {
        window.scrollTo(0, 0);
      });
      }else{
        this.fetchApi();
      }
    }
  },
  created() {
    this.socket = io(this.socketioURL, {
      transports: ["websocket", "polling"],
    });
    this.socket.on("new-user", () => {
      if(this.isLogin){
        this.fetchApi();
      }
    });
    this.socket.on("add-new", () => {
      if(this.isLogin){
        this.fetchApi();
      }
    });
    this.socket.on("update-user", () => {
      if(this.isLogin){
        this.fetchApi();
      }
    });
    this.socket.on("delete-user", () => {
      if(this.isLogin){
        this.fetchApi();
      }
    });
  },
};
</script>

<style scoped>
.btn-confirm {
  color: #ffff;
  background-color: #b00020;
}
.btn-cancel {
  color: #ffff;
  background-color: #9e9e9e;
}
.btn-edit {
  color: #ffff;
  background-color: #00af70;
}

.table {
  background-color: #0008C1;
}

.text-center {
  display: flex;
  justify-content: center;
}
.text-color {
  color: #ffff;
}
.v-responsive__content {
  max-width: 100%;
}

.v-data-table__wrapper {
  overflow-x: auto;
  width: 100%;
}

@media (max-width: 600px) {
  .text-left {
    text-align: center !important;
  }
  .d-flex.justify-center {
    justify-content: center !important;
  }
  .mr-3 {
    margin-right: 0 !important;
    margin-bottom: 8px !important;
  }
}
</style>
