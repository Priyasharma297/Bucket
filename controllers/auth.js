exports.register=(req,res)=>{
    console.log(req.body);
    const mysql=require("mysql2");
    const db = mysql.createConnection({
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE
    });
    const{name,email,password,passwordConfirmed}=req.body;
     db.query('SELECT email FROM user WHERE email=?',[email],async(error,results)=>{
        if(error){
            console.log(error);
        }
        if(results.length>0){
            return res.render('register',{
                message:'Email is already in use , use another....'
            })
        }
        else if(password!==passwordConfirmed){
            return res.render('register',{
                message:'Password do not match !!'
            });
        }
db.query('INSERT INTO user SET ?',{name:name, email:email,password:password},(error, results)=>{
    if(error){
        console.log(error)
    }else{
        console.log(results);
        return res.render('register',{
            message:'User registered'
        });
    }
})

     });
}
exports.login = (req, res) => {
    const mysql = require("mysql2");
    const db = mysql.createConnection({
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE
    });

    const { email, password } = req.body;

    db.query('SELECT * FROM user WHERE email = ?', [email], (error, results) => {
        if (error) {
            console.log(error);
            return res.status(500).send('Internal Server Error');
        }

        if (results.length === 0) {
            return res.render('login', {
                message: 'Email or password is incorrect'
            });
        }

        const user = results[0];

        if (user.password !== password) {
            return res.render('login', {
                message: 'Email or password is incorrect'
            });
        }
        req.session.user = user;

        console.log("Login successful");
        return res.render('user', {
            message: 'Login successful',
            user: user
        });
    });
};
exports.updateProfile = (req, res) => {
    const { address, city, mobile, age, gender } = req.body;
    const user = req.session.user;
    const mysql = require("mysql2");
    if (!user) {
        return res.status(401).send('Unauthorized');
    }

    const db = mysql.createConnection({
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE
    });

    const query = 'UPDATE user SET address = ?, city = ?, mobile = ?, age = ?, gender = ? WHERE email = ?';
    db.query(query, [address, city, mobile, age, gender, user.email], (error, results) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ success: false });
        }

        user.address = address;
        user.city = city;
        user.mobile = mobile;
        user.age = age;
        user.gender = gender;

        return res.json({ success: true });
    });
};