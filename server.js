const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');

//connect ke db
require('./utils/db');
const Event = require('./models/event');
const User = require('./models/user');
const Reflection = require('./models/reflection');
const Timetable = require('./models/timetable');

//middleware
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');


const app = express();
const port = 3000;

//set express
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

app.use(cookieParser('secret'));
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true,
    })
);
app.use(flash());

app.use((req, res, next) => {
    res.locals.nama = req.session.nama;
    res.locals.role = req.session.role;
    next();
});

function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/login');
};
function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const monthIndex = d.getMonth();
    const year = d.getFullYear();
     const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const month = months[monthIndex];
    return `${day} ${month} ${year}`;
}
app.get('/', async (req, res) => {
    const timetables = await Timetable.find();
    const formattedTimetables = timetables.map(timetable => ({
        ...timetable.toObject(),
        tanggal: formatDate(timetable.tanggal)
    }));
    res.render('index',{
        layout : 'layouts/main-layout',
        title : 'Website Gereja',
        timetables : formattedTimetables
    });
});

app.get('/login',(req,res)=>{
    res.render('login',{
        layout : 'layouts/userAuth-layout',
        title : 'login'
    });
});
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userAuth = await User.findOne({ email });
        if (userAuth && userAuth.password) {
            req.session.userId = userAuth._id;
            req.session.nama = userAuth.nama;
            req.session.role = userAuth.role;
            res.redirect('/');
        } else {
            res.status(401).send('Invalid email or password');
        }
    }
    catch (error) {
        res.status(500).send('Server error');
    };
});

app.get('/register',(req,res)=>{
    res.render('register',{
        layout : 'layouts/userAuth-layout',
        title : 'register'
    });
});

app.post('/register', async (req, res) => {
    const {nama, email, password, lahir,alamat,role} = req.body;
    try {
        const userAuth = new User({nama, email,password: password,lahir,alamat,role});
        await userAuth.save();
        res.redirect('/login');
    } catch (error) {
        res.status(400).send('Error registering user');
    }
});

app.get('/about', async(req, res) => {
    res.render('about',{
        layout : 'layouts/main-layout',
        title : 'About Gereja',
    });
});

app.get('/event',async(req, res) => {
    const events = await Event.find();
    const formattedEvents = events.map(event => ({
        ...event.toObject(),
        tanggal: formatDate(event.tanggal)
    }));
     res.render('event',{
         layout : 'layouts/activity-layout',
         title : 'Event Gereja',
         events : formattedEvents
     });
   })
app.get('/admins/add-event',(req,res) =>{
    res.render('admins/add-event',{
        layout : 'layouts/form-layout',
        title : 'Add Event Gereja',
    });
});
app.post('/event', async(req,res) =>{
        await Event.insertMany(req.body);
        res.redirect('/event');
});
app.get('/admins/edit-event/:nama',async(req,res) =>{
    const event = await Event.findOne({nama:req.params.nama});
    res.render('admins/edit-event',{
        layout : 'layouts/form-layout',
        title : 'Edit Event Gereja',
        event
    });
});
app.put('/event',(req,res) =>{
    Event.updateOne(
        {_id:req.body._id},
        {
            $set:
                {
                    nama:req.body.nama,
                    tanggal:req.body.tanggal,
                    deskripsi:req.body.deskripsi
                }
        }
    ).then((result) =>{
        req.flash('msg','Data Event sudah diUpdate');
        res.redirect('/event');
    })
});
app.delete('/event', (req,res)=>{
    Event.deleteOne({nama: req.body.nama}).then((result) =>{
        req.flash('msg','Data Event Sudah Dihapus');
        res.redirect('/event');
    });
});

app.get('/event/:nama', async (req, res) => {
    const event = await Event.findOne({nama: req.params.nama});
    const formattedEvent = {
        ...event.toObject(),
        tanggal: formatDate(event.tanggal)
    };
     res.render('detail-event',{
         layout : 'layouts/detail-layout',
         title : 'Informasi Detail',
         event : formattedEvent
     });
});


app.get('/reflection', async (req, res) => {
    const { tanggal } = req.query;
    let reflections;

    if (tanggal) {
        reflections = await Reflection.find({
            tanggal: {
                $gte: new Date(tanggal), // Mengambil refleksi dari tanggal yang dipilih
                $lt: new Date(new Date(tanggal).setDate(new Date(tanggal).getDate() + 1)) // Sampai sebelum hari berikutnya
            }
        });
    } else {
        reflections = await Reflection.find();
    }


    const formattedReflections = reflections.map(reflection => ({
        ...reflection.toObject(),
        tanggal: formatDate(reflection.tanggal)
    }));
    const noReflectionsFound = formattedReflections.length === 0;

    res.render('reflection', {
        layout: 'layouts/activity-layout',
        title: 'Renungan Harian',
        reflections: formattedReflections,
        noReflectionsFound
    });
});
app.get('/admins/add-reflection',(req,res) =>{
    res.render('admins/add-reflection',{
        layout : 'layouts/form-layout',
        title : 'Add Renungan Gereja',
    });
});
app.post('/reflection', async(req,res) =>{
        await Reflection.insertMany(req.body);
        res.redirect('/reflection');
});
app.get('/admins/edit-reflection/:judul',async(req,res) =>{
    const reflection = await Reflection.findOne({judul:req.params.judul});
    res.render('admins/edit-reflection',{
        layout : 'layouts/form-layout',
        title : 'Edit Renungan Gereja',
        reflection
    });
});
app.put('/reflection',(req,res) =>{
    Reflection.updateOne(
        {_id:req.body._id},
        {
            $set:
                {
                    judul:req.body.judul,
                    tanggal:req.body.tanggal,
                    ayat: req.body.ayat,
                    isian:req.body.isian
                }
        }
    ).then((result) =>{
        req.flash('msg','Data Renungan sudah diUpdate');
        res.redirect('/reflection');
    })
});
app.delete('/reflcetion', (req,res)=>{
   Reflection.deleteOne({nama: req.body.nama}).then((result) =>{
        req.flash('msg','Data Renungan Sudah Dihapus');
        res.redirect('/reflection');
    });
});

app.get('/reflection/:judul', async (req, res) => {
    const reflection = await Reflection.findOne({judul: req.params.judul});
    const formattedReflection = {
        ...reflection.toObject(),
        tanggal: formatDate(reflection.tanggal)
    };
    res.render('detail-reflection',{
         layout : 'layouts/detail-layout',
         title : 'Informasi Renungan',
         reflection : formattedReflection
     });
})

app.get('/admins/add-timetable',(req,res) =>{
    res.render('admins/add-timetable',{
        layout : 'layouts/form-layout',
        title : 'Add Jadwal Gereja',
    });
});
app.post('/timetable', async(req,res) =>{
    await Timetable.insertMany(req.body);
    res.redirect('/');
});
app.get('/admins/edit-timetable/:jadwal',async(req,res) =>{
    const timetable = await Timetable.findOne({jadwal:req.params.jadwal});
    res.render('admins/edit-timetable',{
        layout : 'layouts/form-layout',
        title : 'Edit Jadwal Gereja',
        timetable
    });
});
app.put('/timetable',(req,res) =>{
    Timetable.updateOne(
        {_id:req.body._id},
        {
            $set:
                {
                    jadwal:req.body.jadwal,
                    tanggal:req.body.tanggal,
                    jam: req.body.jam
                }
        }
    ).then((result) =>{
        req.flash('msg','Data Renungan sudah diUpdate');
        res.redirect('/');
    })
});
app.delete('/timetable', (req,res)=>{
   Timetable.deleteOne({jadwal: req.body.jadwal}).then((result) =>{
        req.flash('msg','Data Renungan Sudah Dihapus');
        res.redirect('/');
    });
});

app.get('/profile',isAuthenticated,async(req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    try {
        const profile = await User.findById(req.session.userId);
        if (!profile) {
            return res.status(404).send('User not found');
        }
        res.render('profil', {
                layout: 'layouts/detail-layout',
                title: 'Profile',
                profile
            });
        } catch (error) {
            console.error('Error fetching user profile:', error);
            res.status(500).send('Server error');
        }  
});


app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/');
        }
        res.redirect('/login');
    });
});

app.use('/',(req,res)=>{
    res.status(404).send('404 Not Found');
})

app.listen(port,() =>{
    console.log(`Listening Port ${port}`);
})