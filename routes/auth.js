const express=require('express');
const authController=require('../controllers/auth');  //used for authentication and profile updates
const router=express.Router();

router.post('/register',authController.register)    //When a POST request is made to this route, it will invoke the register function from authController
router.post('/login',authController.login)          //When a POST request is made to this route, it will invoke the login function from authController
router.post('/updateProfile', authController.updateProfile);   //When a POST request is made to this route, it will invoke the updateprofile function from authController

module.exports=router;                         //POST method is typically used to submit data to the server