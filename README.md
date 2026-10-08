# Waikato Building Solutions — Website

A static, responsive business website for Waikato Building Solutions, a residential building company in the Waikato. Plain HTML, CSS and JavaScript, with no build step.

## Pages
- `index.html`: home (hero, services, why choose us, featured projects, testimonial, call to action)
- `about.html`: About Us (story, values, process, team)
- `projects.html`: project gallery with category filters
- `testimonials.html`: client testimonials
- `contact.html`: contact details, quote request form and map

## Before going live
1. **Contact details.** Phone `021 209 3213` and email `admin@waikatobuildingsolutions.com` appear in the header, footer and contact page of every page. To change them, find and replace across all `.html` files.
2. **Contact form.** Enquiries go to Formspree (`https://formspree.io/f/xdeagpew`), which emails them to admin@waikatobuildingsolutions.com. Change the address or view past submissions in your Formspree dashboard.
3. **Testimonials.** Add new reviews to `testimonials.html` by copying the `<figure class="testimonial">` block. Only use genuine reviews, shared with the client's permission.
4. **Projects and photos.** Project photos live in `images/projects/`. Resize photos to about 1600px on the longest side before adding them, and add each one to the gallery in `projects.html` by copying an `<a class="gallery-item">` block.
5. **Owner photo.** Replace the "CH" initials circle in the "Meet the Owner" section of `about.html` with a photo of Cameron.

## Running locally
Open `index.html` in a browser, or run `python3 -m http.server` and go to http://localhost:8000.

## Hosting
Any static host works, including GitHub Pages, Netlify and Cloudflare Pages.
