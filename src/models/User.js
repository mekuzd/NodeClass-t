const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new Schema( //instance the schema is a structure of what goes to the DB
  {
    FirstName: {
      type: Schema.Types.String,
      required: true,
    },
    LastName: {
      type: Schema.Types.String,
      required: true,
    },
    Email: {
      type: Schema.Types.String,
      required: true,
      unique: true,
    },
    Password: {
      type: Schema.Types.String,
      required: true,
    },
    VerifiedEmail: {
      type: Schema.Types.Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function (next) {
  const hashedPassword = await bcrypt.hash(this.Password, 10);
  this.Password = hashedPassword;
  next();
});

const User = model("users", userSchema);

module.exports = User;
