import {
  register,
  login,
  logout,
  saveJob,
  getSavedJobs,
  getToken,
} from "../controllers/user.controller.js";
import verifySignUp from "../middlewares/verifySignup.js";

import express from "express";
const router = express.Router();

router.post("/signup", [verifySignUp], register);

router.post("/signin", login);

router.get("/logout", logout);

router.post("/saveJob", saveJob);

router.post("/getSavedJobs", getSavedJobs);
router.post("/getToken", getToken);
export default router;
