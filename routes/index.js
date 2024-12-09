const express = require("express");
const router = express.Router();
const axios = require("axios");
const nodemailer = require('nodemailer');

 const mailer = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'fooddeck3@gmail.com',
        pass: 'xyca sbvx hifi amzs',
      },
});


const API_URL = "http://kulturalbox.com.ng/api/products/";

// Homepage route
router.get("/", async (req, res) => {
  try {
    const { data: products } = await axios.get(API_URL);
    const suggestedProducts = products.sort(() => 0.5 - Math.random()).slice(0, 8);
    res.render("Homepage", { products, title: "Home" ,
        suggestedProducts
    });
  } catch (err) {
    res.status(500).send("Error loading products");
  }
});

// Product detail route
router.get("/products/:id", async (req, res) => {
  try {
    const { data: product } = await axios.get(`${API_URL}/${req.params.id}`);
    const { data: allProducts } = await axios.get(API_URL);

   
    // Extract measurement data from the product
    // measurements
    const measurements = product.measurements || []; 

    const suggestedProducts = allProducts.sort(() => 0.5 - Math.random()).slice(0, 8);

    res.render("shop-detail", {
      product,
      products: suggestedProducts,
      measurements,  // Pass measurement object to the view
      title: "Product Detail"
    });
  } catch (err) {
    res.status(500).send("Error loading product details");
  }
});

// Product categories route
router.get("/products/categories/:categoryName", async (req, res) => {
    const category = req.params.categoryName;
    console.log(category)

    try {
        // Make a GET request to the external API to fetch products
        const response = await axios.get(`https://pantry-hub-server.onrender.com/api/categories/${category}`);
        

        // Log the response data (for debugging purposes)
        console.log("data is:", response.data);

        // Retrieve the products data from response
        const products = response.data;
        const { data: allProducts } = await axios.get(API_URL);
        const suggestedProducts = allProducts.sort(() => 0.5 - Math.random()).slice(0, 8);

        // Check if no products are found for the category
        if (!products || products.length === 0) {
            // Set flash message
            req.flash('error_msg', `No products found for the category: ${category}`);
            // Redirect to homepage
            return res.redirect('/');
        }

        // Send the category data and products to the EJS template
        res.render('category', {
            title: category.toUpperCase(),
        bestSellerProducts:suggestedProducts,
            products: products 
        });
    } catch (error) {
        // Handle any errors that might occur during the request
        //console.error(error);
        req.flash('error', 'An error occurred while fetching the products.');
        console.log(error)
        res.redirect("/")
    }
});

// Contact page route
router.get("/contact", (req, res) => {
  res.render("contact");
});

// About page route
router.get("/about", (req, res) => {
  res.render("about");
});
// Return policy page route
router.get("/return-policy", (req, res) => {
  res.render("return-policy", {title: "Return Policy"});
});
// privacy policy page route
router.get("/privacy-policy", (req, res) => {
  res.render("privacy-policy", {title: "Privacy Policy"});
});
// privacy policy page route
router.get("/faqs", (req, res) => {
  res.render("faqs", {title: "FAQ"});
});
// paystack callback route
router.get("/callback", (req, res) => {
  res.render("success", {title: "FAQ"});
});

// privacy policy page route
router.get("/helpcenter", (req, res) => {
  res.render("helpcenter", {title: "FAQ"});
});
router.post('/enquiries', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields (name, email, message) are required.' });
  }

  try {
    // Send email to admin
    const adminMailOptions = {
      from: '"KulturalBox Contact Form" <no-reply@kulturalbox.com>',
      to: 'fooddeck3@gmail.com',
      subject: 'New Contact Form Submission',
      html: `
        <h3>New Message from Contact Form</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    };

    // Acknowledge sender with a styled HTML email
    const userMailOptions = {
      from: '"KulturalBox Support" <no-reply@kulturalbox.com>',
      to: email,
      subject: 'Thanks for Contacting KulturalBox!',
      html: `
        <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://firebasestorage.googleapis.com/v0/b/fooddeck-fc840.appspot.com/o/Logo12.png?alt=media&token=56208343-49c1-4664-853f-68e904b1eb7c " alt="KulturalBox Logo" style="max-width: 200px;">
          </div>
          <div>
            <h2 style="color: #FE9801;">Hello, ${name}!</h2>
            <p style="font-size: 16px; color: #333;">Thank you for reaching out to KulturalBox. We’ve received your message and will get back to you as soon as possible.</p>
            <p style="font-size: 16px; color: #333;">Your Message:</p>
            <blockquote style="font-size: 14px; font-style: italic; background: #f9f9f9; padding: 10px; border-left: 4px solid #FE9801; margin: 20px 0;">${message}</blockquote>
          </div>
          <footer style="text-align: center; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; font-size: 14px; color: #666;">
            <p>KulturalBox</p>
            <p>The City Mall, Onikan, Lagos</p>
            <p>Email: info@kulturalbox.com | Phone: +234 912 390 7060</p>
            <p>Website: <a href="https://www.kulturalbox.com" style="color: #FE9801;">www.kulturalbox.com</a></p>
          </footer>
        </div>
      `,
    };

    // Assuming `mailer` is your configured mailing service
    await mailer.sendMail(adminMailOptions);
    await mailer.sendMail(userMailOptions);

    res.status(200).json({ success: 'Message sent successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while sending the message.' });
  }
});



module.exports = router;
