<template>
  <Auth v-if="isLogin">
    <v-container class="grey lighten-5">
      <div>
        <span class="menu-link" @click="goToProfile">จัดการบัญชี</span>
        <v-icon>mdi-chevron-right</v-icon>
        <span class="menu-link-current">ชั้นหนังสือของฉัน</span>
      </div>
      <div class="mt-6 mb-5 d-flex justify-center">
        <h1>ชั้นหนังสือของฉัน</h1>
      </div>
      <div v-if="myBook.length === 0 || myBook === null">
        <div class="d-flex justify-center">
          <img
            src="https://www.mebmarket.com/web/dist/assets/images/imgMebcatMebphone@2x.png"
            alt=""
            width="200"
            height="200"
          />
        </div>
        <div class="noBook">
          <p>ยังไม่มีหนังสือในชั้นหนังสือ</p>
        </div>
        <div>
          <p class="text-center" style="color: #5a5a5a">
            ไม่พบข้อมูลในหัวข้อที่คุณกำลังชมค่ะ
          </p>
        </div>
      </div>
      <div v-else>
        <div class="mb-5 d-flex justify-start">
          <h3>ชั้นหนังสือของฉัน</h3>
        </div>
        <v-divider class="mb-5"></v-divider>
        <v-row>
          <v-col v-for="(item, index) in myBook" :key="index">
            <v-card class="mx-auto" max-width="200" @click="showDetail(item)">
              <v-img :src="item.imageBook" cover></v-img>
              <v-card-title> {{ item.name }} </v-card-title>
              <v-card-subtitle>
                {{ item.author }}/{{ item.publisher }}
              </v-card-subtitle>
              <v-row class="d-flex ma-3">
                <v-col cols="12">
                  <v-row>
                    <v-col class="pa-1" cols="7">
                      <v-rating
                        v-model="item.rating"
                        color="#5a5a5a"
                        active-color="#e83e8c"
                        empty-icon="mdi-cards-heart"
                        full-icon="mdi-cards-heart"
                        readonly
                        hover
                        size="20"
                      ></v-rating>
                      <span class="text-grey-lighten-1 text-caption">
                        ({{ item.ratingsCount }} Rating)
                      </span>
                    </v-col>
                    <v-col cols="5">
                      <v-btn disabled class="btn-color">
                        มีแล้ว
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </v-container>
  </Auth>
  
  <Auth v-if="!isLogin"></Auth>
</template>

<script>
import api from "@/services/api";
import router from "@/router";
import Auth from "@/components/Auth.vue";

export default {
  components:{
    Auth
  },
  data() {
    return {
      myBook: [],
      cartList: [],
    };
  },
  methods: {
    goToProfile() {
      router.push("/profile");
    },
    async getMyBook() {
      const res = await api.get("/inventory/" + this.getId());
      this.myBook = res.data;
    },
    showDetail(item) {
      this.$router.push(`/book/${item._id}`);
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
    
  },
  computed: {
    isLogin() {
      return this.$store.getters["auth/isLogin"];
    },
  },
  mounted() {
    if (this.isLogin) {
      this.getMyBook();
      this.getCartList();
    }
  },
};
</script>

<style scoped>
.btn-color {
  color: #fff;
  background-color: #00af70;
}
.noBook {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  margin-top: 10px;
  margin-bottom: 20px;
}
.close-button {
  display: flex;
  color: gray;
  background-color: white;
  border-radius: 50%;
  position: absolute;
  right: 0px;
  top: 0px;
}
.v-btn.success:hover {
  background-color: gray !important;
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