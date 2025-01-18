import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema({
  shop: {
    type: String,
    required: true,
    unique: true,
  },
  accessToken: String,
  shopOwner: String,
  email: String,
  storeName: String,
});

const Shop = mongoose.model("Shop", shopSchema);
export default Shop;







// import mongoose from 'mongoose';

// const shopSchema = new mongoose.Schema({
//   shop: { type: String, required: true, unique: true },
//   accessToken: { type: String, required: true },
//   name: String,
//   email: String,
//   owner: {
//     firstName: String,
//     lastName: String,
//     email: String,
//   },
//   currencyCode: String,
//   timezone: String,
//   myshopifyDomain: String,
//   plan: {
//     displayName: String,
//   },
// });

// const Shop = mongoose.model('Shop', shopSchema);
// export default Shop;

