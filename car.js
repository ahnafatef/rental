const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const carSchema = new Schema({
    name: {
        type: String,
        required: "must provide name"
    },
    type: {
      type: String, 
      required: "must provide type"
    },
    owner: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: 'must provide owner'
    }],
    availability: {
      type: Boolean,
      required: "must provide availability"
    }
  }
)

const Car = mongoose.model('Car', carSchema);

module.exports = Car;