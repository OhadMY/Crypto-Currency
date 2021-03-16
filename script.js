// Settings array name from localStorage to a variable
const MORE_INFO_COINS = "moreInfoCoins";

// Change duration before fetching data from api in second
const REFETCH_TIME = 5;

$(window).on("load", () => {
  // On load actions
  localStorage.setItem(MORE_INFO_COINS, JSON.stringify([]));
  const fileredCoinId = [];
  const checkedCoinsArray = [];

  // On load function
  search();

  // Show spinner when loading data
  $(".botcontainer").append(
    `<div class="lds-dual-ring overlay" id="spinner"></div>`
  );
  //   Get coins
  $.get("https://api.coingecko.com/api/v3/coins/list", (data) => {
    // Remove spinner after finishing
    $(".botcontainer").empty("#spinner");
    //   Creating the coins
    $(".botcontainer").append(
      `<div id="coins" class="row col-lg-10 col-xxl-12 gap-2 my-2 mx-auto justify-content-center"></div>`
    );
    const offset = 3700;
    for (let i = offset; i < offset + 20; i++) {
      $("#coins").append(`${coinDiv(data[i])}`);
      createfileredCoinId(data[i]);
    }
  });

  //  Create symbol arr
  function createfileredCoinId(coinData) {
    // Limiting search values to fileredCoinId
    fileredCoinId.push(coinData.symbol);
  }

  // Creating coins div
  function coinDiv(coinData) {
    return `<div class="coin card card-body" id="${coinData.id.toLowerCase()}">
    <div class="form-check form-switch">
    <input class="form-check-input myCheckBox" type="checkbox" id="${coinData.id.toLowerCase()}CheckBox">
    </div>
    <h5 class="card-title">${coinData.symbol.toUpperCase()}</h5>
    <p class="card-text">${coinData.name}</p>
    <input type="button" value="More Info" class="coinBtn ${coinData.name.toLowerCase()} btn btn-primary btn-sm"></input>
    <div class="coinInfo" id="coinInfo-${coinData.id.toLowerCase()}" style="display:none"></div>
    </div>`;
  }

  // Create more info div
  const createMoreInfoDiv = (e) => {
    const id = `${e.target.parentElement.id}`;
    const coinInfo = $(`#coinInfo-${id}`);
    const moreInfoCoins = parsedLocalStorageCoinInfo();
    const foundCoinInfo = moreInfoCoins.find((coin) => coin.id === id);
    if (
      (foundCoinInfo &&
        new Date().getTime() - new Date(foundCoinInfo.time).getTime() >=
          1000 * REFETCH_TIME) ||
      !foundCoinInfo
    ) {
      // Show spinner when loading data
      $(".botcontainer").append(
        `<div class="lds-dual-ring overlay" id="spinner"></div>`
      );
      $.get(`https://api.coingecko.com/api/v3/coins/${id}`, (coin) => {
        // Remove spinner after finishing
        $("#spinner").remove();
        // Cleans the div for new data to arrive
        coinInfo.html("");
        $(coinInfo).append(`
          <img src="${coin.image.large}" class="symbol">
          <div>
        <h6>ILS - ${coin.market_data.current_price.ils}₪</h6>
        <h6>USD - ${coin.market_data.current_price.usd}$</h6>
        <h6>EUR - ${coin.market_data.current_price.eur}€</h6>
        </div>
        `);
        writeToLocalStorage(coin);
      });
    }
    $(coinInfo).slideToggle("normal");
  };

  // Sets each coin more info details when clicking more info
  $(document).on("click", ".coinBtn", function (e) {
    createMoreInfoDiv(e);
  });

  // Search Function - need to change
  function search() {
    $(`#formInput`).on("submit", function (e) {
      e.preventDefault();
    });

    $("#inputForm").on("keyup", function (e) {
      e.preventDefault();

      let value = $(this).val().toLowerCase();
      if (fileredCoinId.includes(value)) {
        $(
          "#coins div:not('.moreInfoDiv'):not('.moreInfo'):not('.loaderDiv'):not('.form-check')"
        ).filter(function () {
          $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
      } else {
        $(
          "#coins div:not('.moreInfoDiv'):not('.coinInfo'):not('.loaderDiv'):not('.form-check')"
        ).filter(function () {
          $(this).toggle($(this).text().toLowerCase().indexOf("") > -1);
        });
      }
    });
  }

  // Write to local storage
  const writeToLocalStorage = (coin) => {
    const moreInfoCoins = parsedLocalStorageCoinInfo();
    const foundCoinIndex = moreInfoCoins.findIndex(
      (currentCoin) => currentCoin.id === coin.id
    );
    const foundCoin = moreInfoCoins.find(
      (currentCoin) => currentCoin.id === coin.id
    );
    if (!foundCoin) {
      // Push coin info + time to localstorage if coin is new
      moreInfoCoins.push({
        id: coin.id,
        symbol: coin.image.large,
        prices: {
          ils: coin.market_data.current_price.ils,
          usd: coin.market_data.current_price.usd,
          eur: coin.market_data.current_price.eur,
        },
        time: new Date().getTime(),
      });
    } else if (
      // Changes current coin time if coin already exist
      foundCoin &&
      new Date().getTime() - new Date(foundCoin.time).getTime() >=
        1000 * REFETCH_TIME
    ) {
      moreInfoCoins[foundCoinIndex].time = new Date().getTime();
      // added updated prices
      moreInfoCoins[foundCoinIndex].prices = {
        ils: coin.market_data.current_price.ils,
        usd: coin.market_data.current_price.usd,
        eur: coin.market_data.current_price.eur,
      };
    }
    return localStorage.setItem(MORE_INFO_COINS, JSON.stringify(moreInfoCoins));
  };

  // Gets parsed array from loclStorage by using created variable
  const parsedLocalStorageCoinInfo = () =>
    JSON.parse(localStorage.getItem(MORE_INFO_COINS));

  // Checks if checkbox is checked or not
  $(document).on("click", ".myCheckBox", function (e) {
    let tempCoin = e.target.parentElement.parentElement.id;
    console.log(e.target.checked);
    console.log(tempCoin);
    if (e.target.checked == true) {
      if (checkedCoinsArray.length < 5) {
        console.log("Checkbox is checked.");
        checkedCoinsArray.push(tempCoin);
        console.log(checkedCoinsArray);
      } else {
        alert("didnt happen");
        e.target.checked = false;
      }
    } else if (
      e.target.checked == false &&
      checkedCoinsArray.includes(tempCoin)
    ) {
      console.log("Checkbox is unchecked.");
      checkedCoinsArray.splice(checkedCoinsArray.indexOf(tempCoin), 1);
      console.log(checkedCoinsArray);
    } else {
      alert("didnt happen");
      e.target.checked = false;
    }
  });

  // Creating empty variables to store DOM info
  let aboutPage = null;
  let homePage = null;

  // Switch to about
  $("#aboutPage").on("click", function (e) {
    // Clears checkedCoinsArray
    checkedCoinsArray.splice(0, checkedCoinsArray.length);
    // Check if homePage need to update the info inside it
    if (
      homePage != $(".botcontainer").html() &&
      aboutPage != $(".botcontainer").html()
    ) {
      console.log("works");
      homePage = $(".botcontainer").html();
    }
    // Checks if homePage and aboutPage variable are empty
    if (homePage == null || aboutPage == null) {
      homePage = $(".botcontainer").html();
      // Actually creating aboutPage dynamically
      $(".botcontainer").html(`  <div
      id="about"
      class="d-flex align-items-center justify-content-around mx-auto"
    >
      <div id="picture"></div>
      <div id="info">
        <h3>Hello</h3>
        <h4>My name is Ohad and I'm 27 years old and I'm from Nahariya.</h4>
        <h5>
          My webstie lets the user check out the value of Cryptocurrency in USD,
          ILS or EUR.
        </h5>
      </div>
    </div>`);
      aboutPage = $(".botcontainer").html();
    }
    // Checks if aboutPage is empty and if aboutPage content isnt on screen
    else if (aboutPage != null && aboutPage != $(".botcontainer").html()) {
      $(".botcontainer").empty();
      $(".botcontainer").append(aboutPage);
    }
    console.log(checkedCoinsArray);
  });

  // Switch to home
  $("#home").on("click", function (e) {
    // Checks if aboutPage variable is empty
    if (homePage == null) {
      homePage = $(".botcontainer").html();
    }
    // Check if homePage isnt empty and if homePage content isnt on screen
    else if (homePage != null && homePage != $(".botcontainer").html()) {
      $(".botcontainer").empty();
      $(".botcontainer").append(homePage);
    }
    // Check if aboutPage was built and if homePage content isnt on screen
    else if (aboutPage == null && homePage != $(".botcontainer").html()) {
      $(".botcontainer").empty();
      $(".botcontainer").append(homePage);
    }
  });

  // Alerts that the page isnt ready
  $("#livePage").on("click", function (e) {
    alert("Under Maintenance");
  });

  // Fill here
  // function load() {
  //   $(document).on({
  //     ajaxStart: function () {},
  //     ajaxStop: function () {},
  //   });
  // }
});
