const express 			= require('express'),
	  app				= express(),
	  bodyParser		= require('body-parser'),
	  methodOverride	= require('method-override'),
	  mongoose			= require('mongoose'),
	  multer  			= require('multer'),
	  path				= require('path'),
	  Books				= require('./models/books'),
	  Blogs				= require('./models/blogs'),
	  User				= require('./models/user'),
	  Comment			= require('./models/comments'),
	  passport			= require('passport'),
	  LocalStrategy		= require('passport-local'),
	  port				= 3000;


// app config
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('./public'));
mongoose.connect('mongodb://localhost/ummaymanslibrary:',{
	useNewUrlParser: true,
	useUnifiedTopology: true
})
.then(()=> console.log("Connected to ummaymanslibrary_database"))
.catch(err => (console.log('failed to connect to db', err)))

// disk storage for multer
const storage = multer.diskStorage({
	destination: './public/uploads/',
	filename: function(req, file, cb){
		cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
	}
})

// create upload var

const upload = multer({
	storage,
}).single('post[image]');



// landing page
app.get("/", function(req,res){
	res.send("Welcome to the home page")
})

// blogs routes
app.get('/blogs', async (req,res) => {
	let blogs = await Blogs.find({})
	// console.log(blogs)
	res.render("index", {blogs: blogs})
})

app.get('/blogs/new', (req,res) =>{
	res.render('new');
})

app.post("/blogs", async (req,res)=> {
	let image 
	upload(req,res,(err) => {
		if(err){
			res.render('new', {msg: err})
		} else {
			// console.log(req.file);
			image = req.file
			req.body.post.image = image
			console.log(req.body.post);
		}
	})
	let blog = req.body.post
	// console.log(blog)
	// let blogs = await Blogs.create(blog)
	res.redirect('/blogs')
})

app.get("/blogs/:blogid", async (req,res)=> {
	let blog = await Blogs.findById(req.params.blogid).populate("comments").exec()
	// console.log(blog);
	res.render('show', {blog: blog})
})

// comments route

app.post('/blogs/:blogid', async (req,res) =>{
	let comment = {comment: req.body.comment};
	// console.log(comment)
	let newcomment = await Comment.create(comment);
	let foundblog = await Blogs.findById(req.params.blogid)
	await foundblog.comments.push(newcomment);
	await foundblog.save();
	console.log(foundblog)
	res.redirect("/blogs/" + req.params.blogid);
})


app.listen(port, ()=> console.log(`server is running on port ${port}`))