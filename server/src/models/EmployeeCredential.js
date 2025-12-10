import mongoose from "mongoose";

const EmployeeCredentialSchema = new mongoose.Schema(
  {
    employee_id: { type: Number },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // some existing records may use `password_placeholder`; allow both
    password: { type: String },
    password_placeholder: { type: String },
    name: { type: String },
    role: { type: String, default: "employee" },
  },
  { timestamps: true, collection: "Employee_credentials" }
);

const EmployeeCredential = mongoose.model("EmployeeCredential", EmployeeCredentialSchema);
export default EmployeeCredential;
