const ClockApp = {
  timeElement: document.getElementById('time__element'),
  timeGreetingEl: document.getElementById('time__greeting'),
  timeUserPositionEl: document.getElementById('time__user-position'),

  quoteElements: {
    textEl: document.getElementById('quote__text'),
    authorEl: document.getElementById('quote__author'),
  },

  Init: () => {
    const _this = ClockApp;

    _this.SetBackground('christmas');
    _this.RenderQuote();
    _this.RenderClock();
    _this.GetUserPosition();

    setTimeout(() => {
      document.getElementById('foreground').style.display = 'none';
    }, 4000);
  },

  SetBackground: (keyword = 'mountains', daily = true) => {
    const isDaily = daily ? 'daily' : '';
    const unsplashImage = `https://source.unsplash.com/1920x1080/${isDaily}?${keyword}`;

    document.body.style.background = `url(${unsplashImage})`;
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundSize = 'cover';
  },

  RenderClock: () => {
    const _this = ClockApp;

    const [hour, minutes] = new Date().toLocaleTimeString().split(':');
    _this.timeElement.innerText = `${hour}:${minutes}`;

    const clockInterval = () => {
      const [hour, minutes] = new Date().toLocaleTimeString().split(':');

      let greetingMessage = '';

      if (hour < 12) {
        greetingMessage = 'Good Morning';
      } else if (hour < 18) {
        greetingMessage = 'Good Afternoon';
      } else {
        greetingMessage = 'Good Evening';
      }

      _this.timeGreetingEl.innerText = greetingMessage;
      _this.timeElement.innerText = `${hour}:${minutes}`;
    };

    setInterval(clockInterval, 1000);
  },

  GetQuoteAPI: async () => {
    const API_URL = 'https://type.fit/api/quotes';

    const randomRange = (min, max) => {
      return ~~(Math.random() * (max - min + 1)) + min;
    };

    const getQuote = await fetch(API_URL);
    const quoteResponse = await getQuote.json();

    const quotes = quoteResponse[randomRange(0, 1000)];

    return quotes;
  },

  GetLocalQuote: async () => {
    const _this = ClockApp;

    let getText, getAuthor;
    const todayDate = new Date().getDate();

    if (
      !localStorage.getItem('day') ||
      localStorage.getItem('day') != todayDate
    ) {
      const quote = await _this.GetQuoteAPI();

      localStorage.setItem('day', todayDate);
      localStorage.setItem('quote', JSON.stringify(quote));

      getText = quote.text;
      getAuthor = quote.author;
    } else {
      const { text, author } = JSON.parse(localStorage.getItem('quote'));

      getText = text;
      getAuthor = author;
    }

    return { text: getText, author: getAuthor };
  },

  RenderQuote: async () => {
    const _this = ClockApp;

    const { textEl, authorEl } = _this.quoteElements;
    const { text, author } = await _this.GetLocalQuote();

    textEl.innerText = `"${text}"`;
    authorEl.innerText = `- ${author || 'Unknown'}`;
  },

  GetLocationAPI: async (latitude, longitude) => {
    const API_URL = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;

    const getLocation = await fetch(API_URL);
    const getLocationResponse = await getLocation.json();

    return getLocationResponse;
  },

  RenderPosition: async (position) => {
    const _this = ClockApp;

    const { latitude, longitude } = position.coords;
    const { address } = await _this.GetLocationAPI(latitude, longitude);

    const city = `${address.city || address.town}, `;
    const state = `${!address.state ? `` : `${address.state}, `}`;
    const country_code = `${address.country_code || ''}`;

    _this.timeUserPositionEl.innerText = city + state + country_code;
  },

  GetUserPosition: () => {
    const _this = ClockApp;
    return navigator.geolocation.getCurrentPosition(_this.RenderPosition);
  },
};

ClockApp.Init();
