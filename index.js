const express 			= require('express'),
	  app				= express(),
	  bodyParser		= require('body-parser'),
	  methodOverride	= require('method-override'),
	  expressSession	= require('express-session'),
	  flash				= require('connect-flash'),
	  cloudinary 		= require('cloudinary'),
	  mongoose			= require('mongoose'),
	  multer  			= require('multer'),
	  path				= require('path'),
	  fetch 			= require('node-fetch'),
	  User				= require('./models/user'),
	  Blogs				= require('./models/blog'),
	  // Comment			= require('./models/comments'),
	  passport			= require('passport'),
	  LocalStrategy		= require('passport-local'),
	  // seeds				= require('./seeds')
	  port				= process.env.PORT || 3000;

// seeds();
// app config
require('dotenv').config();
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('./public'));


mongoose.connect('mongodb://localhost/ummaymanslibrary:',{
	useNewUrlParser: true,
	useUnifiedTopology: true
})
.then(()=> console.log("Connected to ummaymanslibrary_database"))
.catch(err => (console.log('failed to connect to db', err)))

// Auth config
app.use(expressSession({
	secret: "Ash Modibbo",
	resave: false,
	saveUninitialized: false
}))

app.use(flash());
app.use(methodOverride('_method'));
// passport config
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



// passing user to pages
app.use(function(req,res,next){
	res.locals.currentUser 	= req.user;
	res.locals.success 		= req.flash("success")
	res.locals.error		= req.flash("error")
	next();
})

// disk storage for multer
const storage = multer.diskStorage({
	// destination: './public/uploads/', for saving in the public folder
	filename: function(req, file, cb){
		cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
	}
})

// create upload var

const upload = multer({
	storage,
	limits: {fileSize: 100000},   // adding limits to the upload
	fileFilter: function(req,file,cb){
		checkFileTypes(file,cb); // to ensure you dont accept other files types	
	}
}).single('image');


// cloudinary config
cloudinary.config({ 
  cloud_name: 'modibbomuhammed', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ian's solution
// var imageFilter = function (req, file, cb) {
//     // accept image files only
//     if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
//         return cb(new Error('Only image files are allowed!'), false);
//     }
//     cb(null, true);
// };

function checkFileTypes(file, cb){
// 	check file type
	const filetypes = /jpeg|jpg|png|gif|jfif/;
	
	const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
	
	const mimetype = filetypes.test(file.mimetype)
	
	if(extname && mimetype){
		return cb(null, true)
	} else {
		 cb('Error: Images Only!!!')
	}
}




// landing page
app.get("/", function(req,res){
	res.send("Welcome to the home page")
})

// blogs routes
app.get('/blogs', async (req,res) => {
	let dbQuery = {}
	if(req.query.search){
	// 	let books 
	// 	let book = req.query.search.replace(/ /g,"+");
	// 	fetch(`https://openlibrary.org/search.json?q=${book}`)
	// 	.then(data => data.json())
	// 	.then(data => {
	// 		books = data.docs
		let { search } = req.query
		 search = new RegExp(escapeRegExp(search), 'gi');
		 dbQuery = {
			$or : [
				{title: search},
				{content: search},
			]
		}

	}
		const delimiter = req.query.search ? '&' : '?';
	
		res.locals.paginateUrl = req.originalUrl.replace(/(\?|\&)page=\d+/g, '') + `${delimiter}page=`;
	// 	return res.render('search', { books })
			
	// 	// fetch('http://openlibrary.org/search.json?q=' + req.query.search)
	// 	// .then(resp => resp.json())
	// }
	
	let blogs = await Blogs.paginate(dbQuery, {
		page: Number(req.query.page) || 1,
		limit: 10,
		sort: '-_id'
	})
	// eval(require('locus'))
	res.render("index", { blogs })
})

app.get('/blogs/new', isLoggedIn, (req,res) =>{
	res.render('new');
})

app.post("/blogs", isLoggedIn, upload, async (req,res)=> {
// 	saving locally in your public folder
	// upload(req,res, async (err) => {
	// 	if(err){
	// 		res.render('new', { msg: err})
	// 	} else {
	// 		let blog = {
	// 			title: req.body.title,
	// 			content: req.body.content,
	// 			image: req.file.filename,
	// 			author: {
	// 				id: req.user._id,
	// 				username: req.user.username
	// 			}
	// 		}
	// 		let blogs = await Blogs.create(blog)
	// 		res.redirect('/blogs')		
	// 	}
	// })
	// console.log(req.file)
	let blog = req.body.blog;
	let result = await cloudinary.uploader.upload(req.file.path);
	
	blog.image = {}
	blog.image.url = result.secure_url
	blog.image.public_id = result.public_id
	blog.author = req.user._id
	
	let blogs = await Blogs.create(blog)	
	res.redirect("/blogs")
	
})

app.get("/blogs/:blogid", async (req,res)=> {
	let blog = await Blogs.findById(req.params.blogid)
	//.populate("comments").exec()
	// console.log(blog);
	
	res.render('show', {blog: blog})
})

app.get('/blogs/:blogid/edit', isLoggedIn, adminChecker, async (req,res) =>{
	let blog = await Blogs.findById(req.params.blogid)
	res.render('edit', { blog })
})

app.put('/blogs/:blogid', isLoggedIn, adminChecker, upload, async (req,res) => {
	let blog = await Blogs.findById(req.params.blogid)
	if(req.file){
		await cloudinary.uploader.destroy(blog.image.public_id);
		let result = await cloudinary.uploader.upload(req.file.path);
		blog.image.url = result.secure_url
		blog.image.public_id = result.public_id
	} 
		const { title, content } = req.body.blog
		blog.title = title
		blog.content = content
		await blog.save()
		res.redirect('/blogs/' + blog.id)
})

// comments route

app.post('/blogs/:blogid', async (req,res) =>{
	let comment = req.body; 
	// let newcomment = await Comment.create(comment);
	let foundblog = await Blogs.findById(req.params.blogid)
	// await foundblog.comments.push(newcomment);
	await foundblog.comments.push(comment);
	await foundblog.save();
	res.redirect("/blogs/" + req.params.blogid);
})


// auth routes 

app.get('/register',(req,res) =>{
	res.render('index/register')
})


app.post('/register', (req,res) =>{
	User.register(new User({username: req.body.username}), req.body.password, function(err,user){
		if(err){
			console.log(err);
			return res.redirect("/register")
		}
		if(req.body.code === '8492') user.isAdmin = true
		user.save()
		passport.authenticate('local')(req,res, () => {
		console.log("from pass authenticate command", user);
			
		req.flash("success","Congratulation you have been registered")
		res.redirect('/blogs')
		})	
	});
		
})

app.get('/login', (req,res)=> {
	res.render('index/login');
})

app.post('/login', passport.authenticate('local', {
		successFlash: 'Welcome Back!!',
		failureFlash: true,
		successRedirect: "/blogs",
		failureRedirect: "back"
}))


app.get('/logout', (req,res) => {
	req.logout();
	res.redirect('/blogs');
})


function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		next()
	} else {
		req.flash("error", "You need to log in before dropping a comment")
		res.redirect("/blogs");
	}
}

function adminChecker(req,res,next){
	if(!req.user.isAdmin){
		req.flash('error', "Sorry you don't have admin priviledges")
		return res.redirect('/blogs')
	}
	next();
} 

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

	
	
app.listen(port, ()=> console.log(`server is running on port ${port}`))