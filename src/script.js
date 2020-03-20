
"use strict"

// === ОБЪЕКТ

/* const obj = {
     key: 'value',
     'key two': 'value2',
     key3: false,
     key4: {
          a: 1,
          b: 2,
     },
     key5: ['array', 5, {v: 3, g: 4,}, [true, 0, 'LoL']],
};
console.log(obj.key);

// ===МАССИВ

const arr = [
     'array',
     5,
     { v: 3, g: 4, },
     [true, 0, 'LoL'],
];
console.log(arr[2]); */




// ===ПЕРЕМЕННЫЕ

const formSearch = document.querySelector('.form-search'),
     inputCitiesFrom = formSearch.querySelector('.input__cities-from'),
     dropdownCitiesFrom = formSearch.querySelector('.dropdown__cities-from'),
     inputCitiesTo = formSearch.querySelector('.input__cities-to'),
     dropdownCitiesTo = formSearch.querySelector('.dropdown__cities-to'),
     inputDateDepart = formSearch.querySelector('.input__date-depart'),
     cheapestTicket = document.getElementById('cheapest-ticket'),
     otherCheapTickets = document.getElementById('other-cheap-tickets');

// ===ДАННЫЕ

const citiesApi = 'dataBasic/cities.json' /* 'http://api.travelpayouts.com/data/ru/cities.json' */,
      proxy = 'https://cors-anywhere.herokuapp.com/',
      apiKey = 'b65ddd91031c8706b96405993669e4d1',
      calendar = 'http://min-prices.aviasales.ru/calendar_preload';

let city = [];

// ===   ФУНКЦИЯ

const getData = (url, callback) => {
     const request = new XMLHttpRequest();

     request.open('GET', url);

     request.addEventListener('readystatechange', () => {
          if(request.readyState !== 4) return;
          
          if(request.status === 200) {
               callback(request.response);
          } else {
               console.error(request.status);
          }
     });

     request.send();
}

const showCity = (input, list) => {
     list.textContent = '';

     if (input.value !== '') {
          const filterCity = city.filter((item) => {
               const fixItem = item.name.toLowerCase();
               return fixItem.startsWith(input.value.toLowerCase());
          });

          filterCity.forEach((item) => {
               const li = document.createElement('li');
               li.classList.add('dropdown__city');
               li.textContent = item.name;
               list.append(li);
          });
     };
};

const selectCity = (event, input, list) => {
     const target = event.target;
     if (target.tagName.toLowerCase() === 'li') {
          input.value = target.textContent;
          list.textContent = '';
     }
};

const getNameCity = (code) => {
     const objCity = city.find((item) => item.code === code);
     return objCity.name;
};

const getDate = (date) => {
     return new Date(date).toLocaleString('ru', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
     });
};

const getChenges = (num) => {
     if (num) {
          return num === 1 ? 'С одной пересадкой' : 'С двумя пересадками';
     } else {
          return 'без пересадок'
     }
};

const createCard = (data) => {
     const ticket = document.createElement('article');
     ticket.classList.add('ticket');

     let deep = '';

     if(data) {
          deep = `
               <h3 class="agent">${data.gate}</h3>
               <div class="ticket__wrapper">
                    <div class="left-side">
                         <a href="https://www.aviasales.ru/search/SVX2905KGD1" class="button button__buy">Купить за ${data.value}₽</a>
                    </div>
                    <div class="right-side">
                         <div class="block-left">
                              <div class="city__from">Вылет из города
				               <span class="city__name">${getNameCity(data.origin)}</span>
                              </div>
                              <div class="date">${getDate(data.depart_date)}</div>
                         </div>

                         <div class="block-right">
                              <div class="changes">${getChenges(data.number_of_changes)}</div>
                              <div class="city__to">Город назначения:
				               <span class="city__name">${getNameCity(data.destination)}</span>
                              </div>
                         </div>
                    </div>
               </div>
          `;
     } else {
          deep = '<h3>билетов нет</h3>';
     };

     ticket.insertAdjacentHTML('afterbegin', deep);

     return ticket;

};

const renderCheepDay = (cheapTicket) => {
     cheapestTicket.style.display = 'block';
     cheapestTicket.innerHTML = '<h2>Самый дешевый билет на выбранную дату</h2>';
     
     const ticket = createCard(cheapTicket[0]);
     cheapestTicket.append(ticket);
}; 

const renderCheepYear = (cheapTickets) => {
     otherCheapTickets.style.display = 'block';
     otherCheapTickets.innerHTML = '<h2>Самые дешевые билеты на другие даты</h2>';

     cheapTickets.sort((a, b) =>  a.value - b.value);
     console.log(cheapTickets);
};

const renderCheep = (data, date) => {
     const cheepTicketYear = JSON.parse(data).best_prices;
     
     const cheepTicketDay = cheepTicketYear.filter((item) => {
          return item.depart_date === date;
     });



     renderCheepDay(cheepTicketDay);
     renderCheepYear(cheepTicketYear); 
};



// ===ОБРОБОТЧИКИ СОБЫТИЙ

inputCitiesFrom.addEventListener('input', () => {
     showCity(inputCitiesFrom, dropdownCitiesFrom)
});

inputCitiesTo.addEventListener('input', () => {
     showCity(inputCitiesTo, dropdownCitiesTo)
});

dropdownCitiesFrom.addEventListener('click', (event) => {
     selectCity(event, inputCitiesFrom, dropdownCitiesFrom)
});

dropdownCitiesTo.addEventListener('click', (event) => {
     selectCity(event, inputCitiesTo, dropdownCitiesTo)
});

formSearch.addEventListener('submit', (event) => {
     event.preventDefault();
     

     const cityFrom = city.find((item) => {
          return inputCitiesFrom.value === item.name
     });
     const cityTo = city.find((item) => {
          return inputCitiesTo.value === item.name
     });

     const formData = {
          from: cityFrom,
          to: cityTo,
          when: inputDateDepart.value, 
     };

     if (formData.from && formData.to) {
          const requestData = `?depart_date=${formData.when}&origin=${formData.from.code}&destination=${formData.to.code}&one_way=true`;
          
          getData(calendar + requestData, (data) => {
               renderCheep(data, formData.when);
          });
     } else {
          alert('Введите правильное название города');
     };

});

// ===ВЫЗОВЫ

getData(citiesApi, (data) => {
     city = JSON.parse(data).filter((item) => {
          return item.name;
     });

     city.sort(function (a, b) {
          if (a.name > b.name) {
               return 1;
          }
          if (a.name < b.name) {
               return -1;
          }
          return 0;
     });
});

















/* getData(proxy + calendar + '?depart_date=2020-05-25&origin=SVX&destination=KGD&one_wey=true&token=' + apiKey, (data) => {
     const cheapTicket = JSON.parse(data).best_price.filter(item => item.depart_date === '2020-05-25');
     console.log(cheapTicket);
}); */