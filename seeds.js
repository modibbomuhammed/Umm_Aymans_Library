const faker = require('faker');
const Blogs = require('./models/blog');



async function seedBlogs() {
	await Blogs.deleteMany({});
	for(const i of new Array(600)) {
		const title = faker.lorem.word();
		const content = faker.lorem.text();
		const blogData = {
			title,
			content,
			author: "5e7e3232dc37db1395b77aa7",
			image: 
				{
					url: 'https://res.cloudinary.com/devsprout/image/upload/v1561315599/surf-shop/surfboard.jpg'
				},
		}
		let blog = new Blogs(blogData);
		await blog.save();
	}
	console.log('600 new blogs created');
}

// export default = seedPosts
module.exports = seedBlogs