<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center">
          <span class="menu-link" @click="goToHome">หน้าแรก</span>
          <v-icon>mdi-chevron-right</v-icon>
          <span class="menu-link-current">อีบุ๊คทั้งหมด</span>
        </div>
      </v-col>
    </v-row>
    <v-row class="mt-10 mb-1">
      <v-col cols="12" class="text-start">
        <h3>อีบุ๊คทั้งหมด</h3>
      </v-col>
    </v-row>
    <v-divider class="mb-6"></v-divider>
    <v-row v-if="books.length > 0">
      <v-col
        v-for="(item, index) in books.slice(
          (page - 1) * itemsPerPage,
          page * itemsPerPage
        )"
        :key="index"
        md="3"
        sm="4"
        xs="6"
      >
        <v-card
          max-width="200"
          class="mx-auto cardHover"
          @click="showDetail(item)"
        >
          <v-img :src="item.imageBook" height="280px" cover />
          <v-card-title class="text-center pb-0" style="font-size: 15px">{{
            item.name
          }}</v-card-title>
          <v-card-subtitle
            class="text-center grey--text"
            style="font-size: 12px"
          >
            {{ item.author }} / {{ item.publisher }}
          </v-card-subtitle>
          <v-card-text class="text-center pb-0 pt-0" style="font-size: 13px">
            <div style="display: inline-block; vertical-align: middle">
              <v-rating
                v-model="item.rating"
                color="#5a5a5a"
                active-color="#e83e8c"
                empty-icon="mdi-cards-heart"
                full-icon="mdi-cards-heart"
                readonly
                hover
                size="16"
              />
            </div>
            <span
              class="ml-2 text-grey-lighten-1 text-caption"
              style="display: inline-block; vertical-align: middle"
            >
              ({{ item.ratingsCount }} Rating)
            </span>
          </v-card-text>
          <v-card-actions class="justify-center">
            <v-btn
              v-if="!checkHaveBook(item)"
              class="btn-color success"
              @click.stop="addItem(item)"
            >
              ฿ {{ item.price }}
            </v-btn>
            <v-btn v-else disabled class="btn-color">มีแล้ว</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col cols="12">
        <div class="d-flex justify-center">
          <img
            :src="'http://localhost:3000/uploads/notfoundicon.png'"
            width="200"
            height="200"
          />
        </div>
        <div class="text-noBook text-center">
          <p>ขออภัยด้วยนะครับ</p>
        </div>
        <div class="text-center mt-3">
          <p class="text-muted">ไม่พบข้อมูลในหัวข้อที่คุณกำลังชมค่ะ</p>
        </div>
      </v-col>
    </v-row>

    <v-row v-if="books.length > 0" class="mt-12">
      <v-col cols="12" class="pa-0">
        <v-pagination
          class="text-pagination"
          v-model="page"
          :length="pages"
          circle
        ></v-pagination>
      </v-col>
    </v-row>

    <v-dialog v-model="showModal" max-width="500px">
      <v-card max-width="400px" class="pa-4">
        <div class="d-flex justify-end pa-0">
          <v-icon @click="hideModal">mdi-close</v-icon>
        </div>
        <v-card-title primary-title class="text-center pa-1">
          เพิ่มหนังสือลงตะกร้าแล้ว
        </v-card-title>
        <v-divider></v-divider>
        <v-container class="pa-2">
          <v-card-actions>
            <v-btn
              class="btn-bg"
              color="success"
              type="submit"
              block
              variant="outlined"
              @click="Stay"
              >เลือกซื้อหนังสือเล่มอื่นต่อ
            </v-btn>
          </v-card-actions>
          <v-card-actions>
            <v-btn
              class="btn-bg1"
              type="submit"
              block
              variant="elevated"
              @click="goToCart"
              >ชำระเงิน
            </v-btn>
          </v-card-actions>
        </v-container>
        <v-divider></v-divider>
        <v-container class="pa-2">
          <v-card-actions>
            <v-btn
              class="btn-bg2"
              type="submit"
              block
              variant="elevated"
              @click="goToCoin"
              >เติม COIN
            </v-btn>
          </v-card-actions>
        </v-container>
      </v-card>
    </v-dialog>
  </v-container>

  <Login
    :visibleModal="visibleModal"
    @update:isVisible="visibleModal = $event"
  />
</template>
<script>
import router from "@/router";
import api from "@/services/api";
import Login from "@/views/User/Login.vue";
import io from "socket.io-client";
export default {
  components: {
    Login,
  },
  data() {
    return {
      books: [],
      myBook: [],
      showModal: false,
      page: 1,
      itemsPerPage: 40,
      visibleModal: false,
      socket: null,
      socketioURL: "http://localhost:3000",
    };
  },
  methods: {
    toggleLoginModal() {
      this.visibleModal = !this.visibleModal;
    },
    goToHome() {
      this.showModal = false;
      router.push("/").then(() => {
        window.scrollTo(0, 0);
      });
    },
    Stay() {
      this.showModal = false;
    },
    goToCart() {
      this.showModal = false;
      router.push("/cart").then(() => {
        window.scrollTo(0, 0);
      });
    },
    goToCoin() {
      this.showModal = false;
      router.push("/coin").then(() => {
        window.scrollTo(0, 0);
      });
    },
    hideModal() {
      this.showModal = !this.showModal;
    },
    showDetail(item) {
      router.push(`/book/${item._id}`).then(() => {
        window.scrollTo(0, 0);
      });
    },
    async addItem(item) {
      if (this.isLogin) {
        const res = await api.post(
          "/cart/" + this.getId() + "/books/" + item._id
        );
        if (
          res.status === 200 &&
          res.data.message === "You have this product in your cart"
        ) {
          this.$swal({
            scrollbarPadding: false,
            confirmButtonColor: "#2F58CD",
            allowOutsideClick: false,
            width: "500",
            text: "คุณมีหนังสือนี้ในตะกร้าแล้ว",
            icon: "warning",
            button: "OK",
          });
        } else {
          this.showModal = true;
          this.getCartList();
        }
      } else {
        this.$swal({
          scrollbarPadding: false,
          confirmButtonColor: "#2F58CD",
          allowOutsideClick: false,
          width: "500",
          text: "กรุณาเข้าสู่ระบบก่อนนำหนังสือเข้าตะกร้าด้วยจ้า",
          icon: "warning",
          confirmButtonText: "OK",
        }).then((result) => {
          if (result.value) {
            this.toggleLoginModal();
          }
        });
      }
    },
    fetchApi() {
      api.get("/books/all").then((result) => {
        this.books = result.data;
      });
    },
    getId() {
      return this.$store.getters["auth/getId"];
    },
    getCartList() {
      api.get("/cart/" + this.getId()).then((result) => {
        this.cartList = result.data.items;
        this.$store.dispatch("cartList/setCartList", this.cartList);
      });
    },
    async getMyBook() {
      const res = await api.get("/inventory/" + this.getId());
      this.myBook = res.data;
    },
  },
  computed: {
    isLogin() {
      return this.$store.getters["auth/isLogin"];
    },
    checkHaveBook() {
      return (item) => {
        return this.myBook.some((book) => book._id === item._id);
      };
    },
    pages() {
      return Math.ceil(this.books.length / this.itemsPerPage);
    },
  },
  watch: {
    showModal(newValue) {
      if (newValue) {
        document.body.classList.add("dialog-open");
      } else {
        document.body.classList.remove("dialog-open");
      }
    },
    isLogin(newValue) {
      if (!newValue) {
        this.myBook = [];
        this.visibleModal = false;
        this.fetchApi();
      } else {
        this.visibleModal = false;
        this.fetchApi();
        this.getMyBook();
      }
    },
  },
  mounted() {
    this.visibleModal = false;
    this.fetchApi();
    if (this.isLogin) {
      this.visibleModal = false;
      this.getMyBook();
    }
  },
  async created() {
    this.socket = io(this.socketioURL, {
      transports: ["websocket", "polling"],
    });
    this.socket.on("new-rating", () => {
      this.fetchApi();
      if (this.isLogin) {
        this.getMyBook();
      }
    });
    this.socket.on("product-sell", () => {
      this.fetchApi();
      if (this.isLogin) {
        this.getMyBook();
      }
    });
    this.socket.on("update-book-edit", () => {
      this.fetchApi();
      if (this.isLogin) {
        this.getMyBook();
      }
    });
    this.socket.on("update-book-delete", () => {
      this.fetchApi();
      if (this.isLogin) {
        this.getMyBook();
      }
    });
    this.socket.on("upload-image-book", () => {
      this.fetchApi();
      if (this.isLogin) {
        this.getMyBook();
      }
    });
    this.socket.on("upload-pdf-book", () => {
      this.fetchApi();
      if (this.isLogin) {
        this.getMyBook();
      }
    });
    this.socket.on("requestbook-approved", () => {
      this.fetchApi();
      if (this.isLogin) {
        this.getMyBook();
      }
    });
  },
};
</script>
<style scoped>
.text-noBook {
  font-size: 18px;
  font-weight: bold;
}
.btn-color {
  color: #fff;
  background-color: #2F58CD;
}
.v-btn.success:hover {
  background-color: gray !important;
}
.cardHover:hover {
  border: 1px solid #2F58CD;
  cursor: pointer;
}
.text-noBook {
  font-size: 18px;
  font-weight: bold;
}

.btn-bg {
  border-radius: 40px;
  font-size: 16px;
}
.btn-bg1 {
  color: #fff;
  background-color: #2F58CD;
  border-radius: 40px;
  font-size: 16px;
}
.btn-bg2 {
  color: #fff;
  background-color: #f58b1b;
  border-radius: 40px;
  font-size: 16px;
}
.menu-link {
  color: #5a5a5a;
  font-size: 14px;
  cursor: pointer;
}
.menu-link-current {
  color: #5a5a5a;
  font-size: 14px;
}
</style>
