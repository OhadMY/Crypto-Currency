// Settings array name from localStorage to a variable
const MORE_INFO_COINS = "moreInfoCoins";

// Change duration before fetching data from api in second
const REFETCH_TIME = 60 * 2;

// Creates coins array
const coins = [];

// 0 = coins page, 2 = about
let currentPageIndex = -1;

// Set the offest of starting points for API data
const offset = 3400;

$(window).on("load", () => {
  // On load action
  localStorage.setItem(MORE_INFO_COINS, JSON.stringify([]));

  // On load function
  search();

  //   Get coins
  $.get("https://api.coingecko.com/api/v3/coins/list", (data) => {
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
      // 0 for coins page
      currentPageIndex = 0;
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

    // const coinIndex =
    if (
      (foundCoinInfo &&
        new Date().getTime() - new Date(foundCoinInfo.time).getTime() >=
          1000 * REFETCH_TIME) ||
      !foundCoinInfo
    ) {
      // Calls to API for the specific coin info
      $.get(`https://api.coingecko.com/api/v3/coins/${id}`, (coin) => {
        // Cleans the div for new data to arrive and then appends new data
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
    } else if (!$(coinInfo).is(":visible")) {
      const coinIndex = moreInfoCoins.findIndex((findId) => id === findId.id);
      coinInfo.html("");
      $(coinInfo).append(`
          <img src="${moreInfoCoins[coinIndex].symbol}" class="symbol">
          <div>
          <h6>ILS - ${moreInfoCoins[coinIndex].prices.ils}₪</h6>
          <h6>USD - ${moreInfoCoins[coinIndex].prices.usd}$</h6>
          <h6>EUR - ${moreInfoCoins[coinIndex].prices.eur}€</h6>
          </div>
        `);
    }
    $(coinInfo).slideToggle("normal");
  };

  // Sets each coin more info details when clicking more info
  $(document).on("click", ".coinBtn", function (e) {
    createMoreInfoDiv(e);
  });

  // Search function
  function search() {
    $(`#formInput`).on("submit", function (e) {
      e.preventDefault();
      let value = $("#inputForm").val().toLowerCase();
      $("#coins>div").filter(function () {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
      });
    });

    $("#inputForm").on("keyup", function (e) {
      e.preventDefault();
      let value = $("#inputForm").val().toLowerCase();
      $("#coins>div").filter(function () {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
      });
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
      // Added updated prices
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
        <h6>The project contains the usage of HTML, CSS, JavaScript, jQuery, Ajax, Rest API & Bootstrap.</h6>
      </div>
    </div>`;
  }

  // Checks if checkbox is checked or not
  $(document).on("click", ".myCheckBox", function (e) {
    let countDivs = $(`.selectedcoins`).length;
    let tempCoinID = e.target.parentElement.parentElement.id;
    let checkedCount = 0;
    const coinIndex = coins.findIndex((coin) => coin.id === tempCoinID);
    coins.forEach((coin) => {
      if (coin.checked) checkedCount++;
    });
    let coinSymbol = coins[coinIndex].symbol.toUpperCase();
    if (e.target.checked == true) {
      console.log("has entered");
      if (checkedCount < 5 && $(`.choosencoins`).is(":hidden")) {
        console.log("work 208");
        console.log(checkedCount);
        coins[coinIndex].checked = true;
        $(".choosencoins .message").after(`
        <div class="selectedcoins" id="${tempCoinID}">
        <h5>${coinSymbol}</h5>
        </div>`);
        $(`.choosencoins #${tempCoinID}`).append($(this).parent().clone());
      } else if (countDivs < 6 && $(`.choosencoins`).is(":hidden")) {
        console.log("work 218");
        console.log(checkedCount);
        console.log(countDivs);
        $(`#${tempCoinID}CheckBox`).prop("checked", false);
        $(".choosencoins #exit").before(`
        <div class="selectedcoins sixthcoin" id="${tempCoinID}">
        <h5>${coinSymbol}</h5>
        </div>`);
        $(`.choosencoins #${tempCoinID}`).append($(this).parent().clone());
        $(".darken").css("display", "block");
        $(".choosencoins").css("display", "block");
      } else if ($(`.choosencoins`).is(":visible")) {
        if (e.target.checked == true && countDivs <= 6) {
          $(`#exit`).attr("disabled", true);
          console.log("is ture");
          coins[coinIndex].checked = true;
          $(`#${tempCoinID}CheckBox`).prop("checked", true);
          $(`.choosencoins #${tempCoinID}`).removeClass("sixthcoin");
          if (countDivs < 6) $(`#exit`).attr("disabled", false);
        }
      } else if (countDivs >= 6) {
        console.log("im here");
        $(`#${tempCoinID}CheckBox`).prop("checked", false);
        if ($(".sixthcoin myCheckBox").prop("checked")) {
          $(".darken").css("display", "block");
          $(".choosencoins").css("display", "block");
          $(`#${tempCoinID}CheckBox`).prop("checked", false);
        } else {
          console.log("iz here");
          $(".sixthcoin").remove();
          $(".choosencoins #exit").before(`
        <div class="selectedcoins sixthcoin" id="${tempCoinID}">
        <h5>${coinSymbol}</h5>
        </div>`);
          $(`.choosencoins #${tempCoinID}`).append($(this).parent().clone());
          $(".darken").css("display", "block");
          $(".choosencoins").css("display", "block");
          $(`#${tempCoinID}CheckBox`).prop("checked", false);
        }
      }
    } else {
      console.log("work 230");
      console.log(checkedCount);
      coins[coinIndex].checked = false;
      console.log(coins[coinIndex].symbol);
      $(`#${tempCoinID}CheckBox`).prop("checked", false);
      $(`.choosencoins #${tempCoinID}`).remove();
      $(`#exit`).attr("disabled", false);
    }
  });

  // Switch to about
  $("#aboutPage").on("click", function (e) {
    if (currentPageIndex !== 2) {
      clearSinglePage();
      $(".botcontainer").append(createAboutPage());
      currentPageIndex = 2;
    }
  });

  // Switch to home
  $("#homePage").on("click", function (e) {
    // Draws all coins again
    coinList(coins);
  });

  // Alerts that the page isnt ready
  $("#livePage").on("click", function (e) {
    alert("Under Maintenance");
  });

  // Removes selection div when clicking on exit
  $(`#exit`).on("click", function (e) {
    if (currentPageIndex === 0) {
      $(".darken").css("display", "none");
      $(".choosencoins").css("display", "none");
    }
  });
});

// Spinner loading animation
$(document)
  .ajaxStart(function () {
    $(".botcontainer").append(
      `<div class="lds-dual-ring overlay" id="spinner"></div>`
    );
  })
  .ajaxStop(function () {
    $("#spinner").remove();
  });
