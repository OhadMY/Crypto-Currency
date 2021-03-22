// Settings array name from localStorage to a variable
const MORE_INFO_COINS = "moreInfoCoins";

// Change duration before fetching data from api in second
const REFETCH_TIME = 5;
// const REFETCH_TIME = 60 * 2;
const coins = [];
const checkedCoinsArray = [];
let currentPageIndex = -1; // 0 = coins page, 2 = about

$(window).on("load", () => {
  // On load actions
  localStorage.setItem(MORE_INFO_COINS, JSON.stringify([]));

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
    // $(".botcontainer").
    const offset = 3400;
    for (let i = offset; i < offset + 20; i++) {
      coins.push({ ...data[i], checked: false });
    }
    coinList(coins);
  });

  // Clears botcontainer
  function clearSinglePage() {
    $(".botcontainer").empty();
  }

  // Creates all coins divs on screen
  function coinList(coins) {
    if (currentPageIndex !== 0) {
      clearSinglePage();
      $("body").append();
      $(".botcontainer").append(
        `<div id="coins" class="row col-lg-10 col-xxl-12 gap-2 my-2 mx-auto justify-content-center"></div>`
      );
      const list = $("#coins");
      coins.forEach((coin) => {
        list.append(coinDiv(coin));
      });
      currentPageIndex = 0; // 0 for coins page
    }
  }

  // Creating coins div
  function coinDiv(coinData) {
    return `<div class="coin card card-body" id="${coinData.id.toLowerCase()}">
    <div class="form-check form-switch">
    <input class="form-check-input myCheckBox" type="checkbox" id="${coinData.id.toLowerCase()}CheckBox" ${
      coinData.checked ? "checked" : ""
    }>
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

    // FIX SEARCH HERE
    $("#inputForm").on("keyup", function (e) {
      e.preventDefault();
      let value = $(this).val().toLowerCase();
      if (fileredCoinId.includes(value)) {
        $("#coins>div").filter(function () {
          $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
      } else {
        $("#coins>div").filter(function () {
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
      // Changes current coin time and prices if coin already exists
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

  // Creates about page
  function createAboutPage() {
    return `<div
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
    </div>`;
  }

  // Checks if checkbox is checked or not
  $(document).on("click", ".myCheckBox", function (e) {
    let tempCoinID = e.target.parentElement.parentElement.id;
    let checkedCount = 0;
    const coinIndex = coins.findIndex((coin) => coin.id === tempCoinID);
    console.log(tempCoinID);
    coins.forEach((coin) => {
      if (coin.checked) checkedCount++;
    });
    if (e.target.checked == true) {
      if (checkedCount < 5) {
        coins[coinIndex].checked = true;
        // Adding the checkbox to the choosencoins div
        $(".choosencoins").append(`
        <div class="selectedcoins" id="${tempCoinID}">
        <h5>${tempCoinID}</h5>
        </div>`);
        $(`.choosencoins #${tempCoinID}`).append($(this).parent().clone());
      } else {
        $(".darken").css("display", "block");
        e.target.checked = false;
      }
    } else {
      coins[coinIndex].checked = false;
      $(`.choosencoins #${tempCoinID}`).remove();
    }
  });

  // Switch to about
  $("#aboutPage").on("click", function (e) {
    // Clears checkedCoinsArray
    checkedCoinsArray.splice(0, checkedCoinsArray.length);
    if (currentPageIndex !== 2) {
      clearSinglePage();
      $(".botcontainer").append(createAboutPage());
      currentPageIndex = 2;
    }
  });

  // Switch to home
  $("#home").on("click", function (e) {
    coinList(coins);
  });

  // Alerts that the page isnt ready
  $("#livePage").on("click", function (e) {
    alert("Under Maintenance");
  });

  // Removes selection div when clicking on darken area
  $(`.darken`).on("click", function (e) {
    if (currentPageIndex === 0) $(".darken").css("display", "none");
  });

  // Lets you click on the inner div without exsiting it
  $(`.choosencoins`).on("click", function (e) {
    e.stopPropagation();
  });
});
