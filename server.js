const mongoose = require('mongoose');
const app = require('./app');



mongoose
  .connect(process.env.URL_MONGODB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection successful!'))
  .catch((e) => console.log(`mongodb problem ${e}`))

const port = 5000 || process.env.PORT
app.listen(port, () => console.log(`server started on ${process.env.PORT}`))

