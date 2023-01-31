import { createStore } from "vuex";
import auth from "./modules/auth";
import authAdmin from "./modules/authAdmin";
export default createStore({
  state: {
    cartList: [],
  },
  getters: {
    cartListCount(state) {
      return state.cartList.length;
    },
    getTotalPrice(state) {
      var total = 0;

      state.cartList.forEach((item) => {
        total += parseInt(item.price);
      });

      return total;
    },
  },
  mutations: {
    addItem(state, product) {
      let duplicaProduct = state.cartList.find((item) => {
        return item._id === product._id;
      });
      if (!duplicaProduct) {
        state.cartList.push(product);
      }
    },
    delItem(state, product) {
      var index = state.cartList.findIndex(
        (productIndex) => productIndex._id == product
      );
      state.cartList.splice(index, 1);
    },
  },
  actions: {
    addItemToCart(context, item) {
      context.commit("addItem", item);
    },
    delItemCart(context, product) {
      context.commit("delItem", product);
    },
  },
  modules: {
    auth,
    authAdmin,
  },
});
