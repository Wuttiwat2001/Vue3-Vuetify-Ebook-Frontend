<template>
  <div class="mb-5 d-flex justify-center">
    <h1 class="mt-8">รายละเอียดหนังสือ</h1>
  </div>
  <v-divider class="mb-6"></v-divider>
  <v-card class="mx-auto mt-5">
    <v-card-text>
        <div v-if="books.length === 0">
          <div class="d-flex justify-center">
            <img
              :src="'http://localhost:3000/uploads/notfoundicon.png'"
              alt=""
              width="200"
              height="200"
            />
          </div>
          <h3 class="text-center">ขออภัยด้วยนะครับ</h3>
          <div>
            <p class="text-center" style="color: #5a5a5a">ไม่พบรายการที่คุณค้นหา</p>
          </div>
        </div>
      <v-row v-else>
        <v-col cols="4">
          <v-img :src="books.imageBook" aspect-ratio="1"></v-img>
        </v-col>
        <v-col cols="8">
          <h3 class="mb-3">{{ books.name }}</h3>
          <p class="mb-3">วันเวลาที่เพิ่ม : {{ formatTime(books.createAt) }}</p>
          <p class="mb-2">โดย {{ books.author }}</p>
          <p class="mb-2">สำนักพิมพ์ {{ books.publisher }}</p>
          <p class="mb-2">หมวดหมู่ {{ books.category }}</p>
          <p class="mb-2">ราคา {{ books.price }} บาท</p>
          <p class="mb-2">ยอดขาย {{ books.sold }} เล่ม</p>
          <p class="mb-2">เรตติ้ง {{ books.rating }}</p>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
<script>
import router from "@/router";
import api from "@/services/api";
import moment from "moment";
import io from "socket.io-client";
export default {
  data() {
    return {
      books: [],
      socket: null,
      socketioURL: "http://localhost:3000",
    };
  },
  methods: {
    formatTime(item) {
      return moment(item).format("DD/MM/YYYY, HH:mm:ss");
    },
    async fetchApi() {
      const res = await api.get("/books/" + this.$route.params.id);
      this.books = res.data
    },
    getId() {
      return this.$store.getters["authAdmin/getId"];
    },
  },
  computed: {
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
      if(!res.data.user.roles.includes("LOCAL_ADMIN")){
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
    this.socket.on("product-sell", () => {
      if(this.isLogin){
        this.fetchApi();
      }
    });
    this.socket.on("update-book-edit", (data) => {
      if(this.isLogin){
        if(data.book._id === this.$route.params.id){
          this.fetchApi()
        }
      }
    });
    this.socket.on("update-book-delete", (data) => {
      if(this.isLogin){
        if(data.bookDeleted.bookId === this.$route.params.id){
          router.push("/bookadmin");
      }
      }
    });
  },
};
</script>
<style scoped>
</style>
