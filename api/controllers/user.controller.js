import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import User from "../models/User.model.js";
import Token from "../models/Token.js";
import { registerValidation, loginValidation } from "../validation.js";
import Job from "../models/Job.model.js";
let tokenLisk = {};
//register controller
export const register = async (req, res) => {
  //validate user data
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let salt = bcryptjs.genSaltSync(10);
  let newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcryptjs.hashSync(req.body.password, salt),
  });
  try {
    newUser.save().then((user) => {
      return res.status(200).send("Registered successfully!");
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

export const login = async (req, res) => {
  //validate user data
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).send("User Not Found!");
  } else {
    bcryptjs.compare(req.body.password, user.password, (err, result) => {
      if (err) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid email or password",
        });
      }

      if (result) {
        let token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
          expiresIn: 86400,
        });
        let refreshToken = jwt.sign(
          { _id: user._id },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: "7d" }
        );
        //save token
        let newToken = new Token({
          userId: user._id,
          token: token,
          refreshToken: refreshToken,
        });
        newToken.save().then((token) => {
          //send user id as a cookie
          try {
            //send user id as a cookie
            let response = {
              status: "Logged In",
              accessToken: token.token,
              refreshToken: token.refreshToken,
              uId : token.userId
            };
            tokenLisk[refreshToken] = response;
            return res.status(200).send(response);
          } catch (err) {
            return res.status(500).send({ message: err.message });
          }
        });
      } else {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid email or password",
        });
      }
    });
  }
};

export const logout = async (req, res) => {
  try {
    let token = req.header("auth-token");
    let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    let userId = decoded._id;
    await Token.findOneAndDelete({ userId: userId });
    return res.status(200).send({ message: "Logout successfully!" });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

//save job with job referenc
export const saveJob = async (req, res) => {
  try {
    let { jobId, userId } = req.body;
    let user = await User.findOne({ _id: userId });
    let job = await Job.findOne({ _id: jobId });
    //add saved property to job

    if (!user || !job) {
      return res.status(404).send("User or Job not found!");
    }
    //delete job if already exists
    let index = user.savedJobs.indexOf(jobId);
    if (index >= 0) {
      user.savedJobs.splice(index, 1);
      user.save();
      return res
        .status(200)
        .send({ message: "Job deleted successfully!", jobs: user.savedJobs });
    }
    Job.findOneAndUpdate({ _id: jobId }, { saved: true });
    user.savedJobs.push(job);
    user.save();
    return res.status(200).send("Job saved successfully!");
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

// get saved jobs
export const getSavedJobs = async (req, res) => {
  try {
    let userId = req.body.userId;
    let user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).send("User not found!");
    }
    let savedJobs = user.savedJobs;
    let jobs = await Job.find({ _id: { $in: savedJobs } });
    return res.status(200).send(jobs);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

export const getToken = async (req, res) => {
  try {
    let refreshToken = req.body.refreshToken;
    let userId = jwt.decode(refreshToken)._id;
    let response = tokenLisk[refreshToken];
    if (!response) {
      return res.status(404).send("Refresh token not found!");
    }
    let token = jwt.sign({ _id: userId }, process.env.TOKEN_SECRET, {
      expiresIn: 86400,
    });
    let newToken = new Token({
      userId: response.userId,
      token: token,
      refreshToken: refreshToken,
    });
    newToken.save().then((token) => {
      //send user id as a cookie
      try {
        //send user id as a cookie
        let response = {
          status: "Logged In",
          accessToken: token.token,
          refreshToken: token.refreshToken,
        };
        tokenLisk[refreshToken] = response;
        return res.status(200).send(response);
      } catch (err) {
        return res.status(500).send({ message: err.message });
      }
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};
