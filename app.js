/* Royal Spice — premium UI interactions
   - Scroll reveal animations
   - Smooth masonry/gallery injection
   - Glassmorphism hover + ordering interactions (menu)
*/

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// ---------- Scroll Reveal (IntersectionObserver) ----------
function setupReveal(){
  const els = $$('[data-reveal]');
  if(!('IntersectionObserver' in window)){
    els.forEach(el => el.classList.add('is-revealed'));
    return;
  }

  const io = new IntersectionObserver((entries)=>{
    for(const e of entries){
      if(e.isIntersecting){
        e.target.classList.add('is-revealed');
        io.unobserve(e.target);
      }
    }
  }, {threshold: 0.15});

  els.forEach(el => io.observe(el));
}

// ---------- Lightweight Parallax (subtle) ----------
function setupParallax(){
  const parallaxEls = $$('[data-parallax]');
  if(!parallaxEls.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) return;

  const onScroll = () => {
    const y = window.scrollY || 0;
    parallaxEls.forEach((el, idx) => {
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if(!inView) return;
      const speed = 0.06 + idx * 0.01;
      el.style.transform = `translateY(${Math.min(18, y * speed) * -1}px)`;
    });
  };
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
}

// ---------- Toast ----------
function toast(msg){
  const t = $('#toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('is-visible');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(()=>t.classList.remove('is-visible'), 2200);
}

// ---------- Menu data + rendering ----------
const MENU_ITEMS = [
  {
    name: 'Butter Chicken',
    price: 499,
    rating: 4.8,
    desc: 'Creamy, slow-braised tandoor chicken in a silky tomato-cream gravy—balanced spice, buttery finish.',
    img: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=1200&auto=format&fit=crop'
  },
  {
    name: 'Paneer Tikka',
    price: 349,
    rating: 4.7,
    desc: 'Char-kissed paneer cubes marinated in yogurt and warm spices, grilled to golden edges.',
    img: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?q=80&w=1200&auto=format&fit=crop'
  },
  {
    name: 'Hyderabadi Biryani',
    price: 599,
    rating: 4.9,
    desc: 'A fragrant dum-style biryani bowl with aromatic spices and tender, flavorful layers.',
    img: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=1200&auto=format&fit=crop'
  },
  {
    name: 'Margherita Pizza',
    price: 449,
    rating: 4.6,
    desc: 'Italian-style margherita with fresh tomatoes, basil, and melty mozzarella—light and elegant.',
    img: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?q=80&w=1200&auto=format&fit=crop'
  },
  {
    name: 'Veg Burger',
    price: 299,
    rating: 4.5,
    desc: 'A premium veg burger with a crisp golden patty, fresh toppings, and sides that hit just right.',
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1200&auto=format&fit=crop'
  },
  {
    name: 'White Sauce Pasta',
    price: 399,
    rating: 4.5,
    desc: 'Creamy parmesan white sauce pasta with a gentle pepper warmth—comforting and refined.',
    img: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?q=80&w=1200&auto=format&fit=crop'
  },
  {
    name: 'Tandoori Chicken',
    price: 699,
    rating: 4.9,
    desc: 'Smoky, flame-kissed tandoori chicken with citrus marinade—tender inside and beautifully charred.',
    img: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?q=80&w=1200&auto=format&fit=crop'
  },
  {
    name: 'Chocolate Lava Cake',
    price: 249,
    rating: 4.8,
    desc: 'A dramatic chocolate lava center—warm, glossy, and indulgently rich.',
    img: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=1200&auto=format&fit=crop'
  }
];

function stars(r){
  const full = Math.round(r);
  return '★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5-full);
}

function renderMenu(){
  const grid = $('#menuGrid');
  if(!grid) return;

  grid.innerHTML = '';

  MENU_ITEMS.forEach((it, idx) => {
    const card = document.createElement('article');
    card.className = 'menuCard';
    card.setAttribute('data-name', it.name.toLowerCase());

    card.innerHTML = `
      <div class="menuCard__media" style="background-image:url('${it.img}')" role="img" aria-label="${it.name}"></div>

      <div class="menuCard__body">
        <div class="menuCard__top">
          <div>
            <div class="menuCard__name">${it.name}</div>
            <div class="rating">
              <span class="stars" aria-hidden="true">${stars(it.rating)}</span>
              <span>${it.rating.toFixed(1)}</span>
            </div>
          </div>
          <div class="menuCard__price">₹${it.price}</div>
        </div>
        <p class="menuCard__desc">${it.desc}</p>
        <div class="menuCard__actions">
          <button class="btn btn--gold btn--small menuCard__orderBtn" type="button" data-add="${idx}">
            Order
          </button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

// ---------- Order state (simple cart count) ----------
let orderCount = 0;
function updateOrderCount(){
  const el = $('#orderCount');
  if(el) el.textContent = `${orderCount} items`;
}

function setupMenuInteractions(){
  const grid = $('#menuGrid');
  if(!grid) return;

  grid.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-add]');
    if(!btn) return;
    orderCount++;
    updateOrderCount();
    toast('Added to your order.');
  });

  const search = $('#dishSearch');
  if(search){
    search.addEventListener('input', ()=>{
      const q = search.value.trim().toLowerCase();
      const cards = $$('.menuCard', grid);
      cards.forEach(c => {
        const name = c.getAttribute('data-name') || '';
        c.style.display = name.includes(q) ? '' : 'none';
      });
    });
  }

  const checkout = $('#checkoutBtn');
  if(checkout){
    checkout.addEventListener('click', ()=>{
      if(orderCount === 0){
        toast('Your order is empty. Add a dish first.');
        return;
      }
      toast(`Checkout started for ${orderCount} item(s).`);
      location.hash = '#reservations';
    });
  }
}

// ---------- Gallery + Testimonials injection ----------
function renderGallery(){
  const wrap = $('#masonry');
  if(!wrap) return;

  const images = [
    'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1400&q=70',
    'https://images.unsplash.com/photo-1541544181074-e0e8c2f3a9dd?auto=format&fit=crop&w=1400&q=70',
    'https://images.unsplash.com/photo-1526318472351-c75fcf070305?auto=format&fit=crop&w=1400&q=70',
    'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1400&q=70',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1400&q=70',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=70',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=70',
    'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=1400&q=70'
  ];

  wrap.innerHTML = images.map((src, i)=>{
    const h = 240 + (i % 4) * 30;
    return `
      <div class="gItem" style="--h:${h}px">
        <figure>
          <div class="gImg" style="background-image:url('${src}'); height:${h}px"></div>
        </figure>
      </div>
    `;
  }).join('');
}

function renderTestimonials(){
  const grid = $('#testimonialGrid');
  if(!grid) return;

  const reviews = [
    {
      name:'Aarav Mehta', meta:'Dum Biryani • Weekend guest',
      quote:'The lighting, pacing of service, and the biryani aroma felt genuinely premium. Butter chicken was silky—exactly how it should be.' ,
      img:'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=70',
      rating:5
    },
    {
      name:'Neha Kulkarni', meta:'Anniversary table',
      quote:'Everything tasted “handcrafted.” Dessert arrived warm and perfectly portioned. The ambience is cinematic without feeling overdone.',
      img:'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=300&q=70',
      rating:5
    },
    {
      name:'Rohit Sharma', meta:'Chef’s signature picks',
      quote:'Paneer tikka had that charcoal finish and the sauces were balanced. Staff attention felt natural, not scripted.',
      img:'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=70',
      rating:4.9
    }
  ];

  grid.innerHTML = reviews.map(r=>{
    return `
      <article class="tCard">
        <div class="tCard__top">
          <div class="avatar"><img alt="${r.name}" src="${r.img}" loading="lazy"></div>
          <div>
            <div class="tName">${r.name}</div>
            <div class="tMeta">${r.meta}</div>
          </div>
        </div>
        <div class="rating" style="margin-top:12px; position:relative; z-index:1;">
          <span class="stars" aria-hidden="true">${stars(r.rating)}</span>
          <span>${r.rating.toFixed(1)}</span>
        </div>
        <p class="tQuote">“${r.quote}”</p>
      </article>
    `;
  }).join('');
}

// ---------- Reservation form UX ----------
function setupReservationForm(){
  const form = $('#reservationForm');
  if(!form) return;

  const hint = $('#formHint');

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());

    // Basic validation
    if(!data.name || !data.email || !data.phone || !data.date || !data.time || !data.guests){
      hint.textContent = 'Please complete all required fields.';
      toast('Missing details.');
      return;
    }

    hint.textContent = 'Booking request received. We’ll confirm shortly.';
    toast('Reservation request sent.');
    form.reset();
  });
}

// ---------- Footer year ----------
function setupYear(){
  const y = $('#year');
  if(y) y.textContent = new Date().getFullYear();
}

// ---------- Mobile Nav toggle ----------
function setupMobileNav(){
  const navbar = $('.navbar');
  const nav = $('.nav');
  const toggle = $('.nav__toggle');
  if(!nav || !toggle) return;

  toggle.addEventListener('click', ()=>{
    const open = nav.getAttribute('data-open') === 'true';
    nav.setAttribute('data-open', open ? 'false' : 'true');
  });

  // close on link click
  $$('.nav__links a', nav).forEach(a=>{
    a.addEventListener('click', ()=>{
      nav.setAttribute('data-open','false');
    });
  });
}

// ---------- Init ----------
(function init(){
  setupReveal();
  setupParallax();
  setupYear();
  setupMobileNav();

  renderMenu();
  updateOrderCount();
  setupMenuInteractions();

  renderGallery();
  renderTestimonials();

  setupReservationForm();
})();

