const cloudinary = require('cloudinary');

cloudinary.config({
cloud_name: 'dvrrkf82g',
api_key: process.env.CLOUDINARY_API,
api_secret: process.env.CLOUDINARY_SECRET
});

exports.uploads = (file) =>{
    return new Promise(resolve => {
    cloudinary.uploader.upload(file, (result) =>{
        console.log(result)
    resolve({url: result.url, id: result.public_id})
    }, {resource_type: "auto"})
    })
}