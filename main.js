const mainContent = $('.main-content');
let expandedCoins = new Map();
let toggledCoins = new Map();
let toggledCoinsCounter = 0;
let allCoinsArray, canvasInterval;

(function () {
  createSpinner('.main-content')
  $.ajax({
    url: 'https://api.coingecko.com/api/v3/coins',
    type: 'GET',
    success: function (data) {
      allCoinsArray = data;
      $('.main-content').find('.spinner').remove()
      showCoins(); // Show all coins recieved from ajax request
    },
    error: function (request, message, error) {
      console.log('Failure');
    }
  });
})();

function showCoins() {
  mainContent.html(''); // Reset main content div
  clearInterval(canvasInterval);

  let allCoinsDiv = $('<div class="all-coins">');
  mainContent.append(allCoinsDiv);

  for (let i = 0; i < allCoinsArray.length; i++) {
    createCard(i, allCoinsDiv);
  }
}

function createCard(i, parentDiv) {
  let newCard = $(`<div class="card" id="${allCoinsArray[i].id}"></div>`);

  let coinHeader = $('<div class="coin-header">');
  newCard.append(coinHeader);

  let coinSymbol = $('<h3 class="coin-symbol">');
  coinSymbol.html(allCoinsArray[i].symbol);
  coinHeader.append(coinSymbol);

  let toggleLabel = $('<label class="toggle-btn"><span class="slider round">');
  let toggleBtn = $('<input type="checkbox" onclick="toggle(this)">')
  coinHeader.append(toggleLabel);
  toggleLabel.prepend(toggleBtn);

  // If coin switch was toggled before, create it toggled already
  if (toggledCoins.get(allCoinsArray[i].symbol)) {
    toggleBtn.prop('checked', true);
  }

  let coinName = $('<div class="coin-name">');
  coinName.html(allCoinsArray[i].name);
  newCard.append(coinName);

  let moreInfoBtn = $('<div class="more-info-btn">');
  moreInfoBtn.html('<input type="button" class="btn" value="More info" onclick="onMoreInfo(this)">');
  newCard.append(moreInfoBtn);

  parentDiv.append(newCard);
}

function onMoreInfo(button) {
  coinCardDiv = $(button).parents()[1];
  let coinId = coinCardDiv.id;

  if (button.value == 'Less info') { // If already clicked, remove info div ("close" more info)
    $('#' + coinId).css('max-height', '');
    closeMoreInfo(button, coinId);
  }

  else if (!expandedCoins.get(coinId)) {
    $('#' + coinId).css('max-height', '305px'); // Animate more info open
    getCoinInfo(button, coinId);
  }

  else {
    $('#' + coinId).css('max-height', '305px');
    moreInfo(button, coinId);
  }
}

function getCoinInfo(button, coinId) {
  $(button).attr('onclick', ''); // Disable option for multiple ajax requests before result recieved
  $(button).val('Less info');
  createSpinner('#' + coinId);

  $.ajax({
    url: 'https://api.coingecko.com/api/v3/coins/' + coinId,
    type: 'GET',
    success: function (coinData) {
      $('#' + coinId).find('.spinner').remove();
      expandedCoins.set(coinId, coinData); // Cache coin info
      setTimeout(function () { expandedCoins.delete(coinId) }, 120000); // Delete cached coin info after 2 min
      moreInfo(button, coinId);
    },
    error: function (request, message, error) {
      $(button).attr('onclick', 'onMoreInfo(this)');
      console.log('Failure');
    }
  });
}

function moreInfo(button, coinId) {
  let coinData = expandedCoins.get(coinId);
  $(button).attr('onclick', 'onMoreInfo(this)');
  $(button).val('Less info');

  let coinInfo = $('<div class="coin-info">');
  coinInfo.html(
    `<div class="currency">
        <i class="fa fa-dollar-sign"></i> ${coinData.market_data.current_price.usd}<br>
        <i class="fa fa-euro-sign"></i> ${coinData.market_data.current_price.eur}<br>
        <i class="fa fa-shekel-sign"></i> ${coinData.market_data.current_price.ils}
      </div><img src="${coinData.image.large}">`
  );
  $('#' + coinId).append(coinInfo);
}

function closeMoreInfo(button, coinId) {
  $(coinCardDiv).children().last().remove(); // Remove more info div
  $(button).val('More info');
}

function searchCoin() {
  let searchInput = $('#searchCoin');
  let searchedCoinSymbol = searchInput.val().toLowerCase().trim();
  let searchedCoinIndex = allCoinsArray.findIndex(x => x.symbol == searchedCoinSymbol);

  if (searchedCoinSymbol == '') {
    alert('Enter coin symbol');
    return;
  }

  else if (searchedCoinIndex == -1) {
    let content = "The coin you searched for does not exist.";
    createPage('searchedCoin', content);
  }

  else {
    showSearchedCoin(searchedCoinIndex);
  }

  searchInput.val('');
  $('.nav-btn').removeClass('active');
  $('.nav-btn').prop('disabled', false);
  clearInterval(canvasInterval);
}

function showSearchedCoin(searchedCoinIndex){
  mainContent.html('');
  let searchedCoinDiv = $('<div class="searchedCoin flex">');
  mainContent.append(searchedCoinDiv);

  createCard(searchedCoinIndex, searchedCoinDiv);

  let searchedCoinId = allCoinsArray[searchedCoinIndex].id;
  let moreInfoButton = $('#' + searchedCoinId).find('input')[1];
  onMoreInfo(moreInfoButton);
  moreInfoButton.remove();
}

function toggle(checkbox) {
  let coinSymbol = $(checkbox).parent().siblings("h3").text();

  if (toggledCoins.get(coinSymbol)) { // If coin already toggled, delete it from the toggled coins map
    toggledCoins.delete(coinSymbol);
    toggledCoinsCounter--;
  }

  else {
    toggledCoins.set(coinSymbol, true); // Save coin as toggled
    toggledCoinsCounter++;
  }

  if (toggledCoinsCounter == 6) { // If user picked more than 5 coins, uncheck the 6th coin and show modal
    toggledCoins.delete(coinSymbol);
    toggledCoinsCounter--;
    $(checkbox).prop("checked", false);
    modalPopUp(coinSymbol);
  }
}

function modalPopUp(extraCoinSymbol) {
  let cancelToggledCoins = new Map(toggledCoins); // Save current toggled coin in case user wants to cancel
  let modal = $('#coinSelectionModal');

  modal.css('display', 'block');
  $('body').css('overflow', 'hidden');

  $('#save').click(function () {
    modal.css('display', 'none');
    $('body').css('overflow', 'auto');
    showCoins();
  });

  $('#cancel').click(function () {
    modal.css('display', 'none');
    $('body').css('overflow', 'auto');
    toggledCoins = cancelToggledCoins;
    toggledCoinsCounter = 5;
  });

  $('.toggledCoins').html('');
  $('.extraToggledCoin').html('');
  chooseCoinsInModal(extraCoinSymbol);
}

function chooseCoinsInModal(extraCoinSymbol) {
  let extraCoinIndex = allCoinsArray.findIndex(x => x.symbol == extraCoinSymbol);
  createCard(extraCoinIndex, $('.extraToggledCoin')); // Place last added coin at the top of modal

  for (let toggledCoinId of toggledCoins.keys()) { // Show all toggled coins
    let toggledCoinIndex = allCoinsArray.findIndex(x => x.symbol == toggledCoinId);
    createCard(toggledCoinIndex, $('.toggledCoins'));
    $('#' + toggledCoinId).find('input')[1];
  }

  let moreInfoBtns = $('.modal-body').find('input.btn');
  moreInfoBtns.remove(); // Remove more info buttons
}

function createPage(pageClass, content) {
  mainContent.html('');
  let pageDiv = $('<div class="' + pageClass + ' page">');
  pageDiv.html(content);
  mainContent.append(pageDiv);
}

function liveReportsPage() {
  let content;

  if (Array.from(toggledCoins)[0]) { // If at least one coin was toggled, show chart
    content = '<div id="chartContainer"></div>';
    createPage('live-reports', content);
    canvasData();
  }

  else { // Else, show instructions
    content =
      `<h1 class="decorated-title"><span>Live reports</span></h1>
    <p class="page-text">
    Here you can compare between multiple crypto currencies of your choice and see its updated price live.<br>
    You can choose up to 5 coins to be shown.<br>
    <b>To view the chart, please select at least one currency from the currencies list.</b>
    </p>`;
    createPage('live-reports', content);
  }
}

function aboutPage() {
  clearInterval(canvasInterval);

  let content = 
  `<h2 class="decorated-title"><span>About me</span></h2>
  <p class="page-text">
      My name is Tomer Haziza. <br>
      I am 24 years old from Rishon Lezion, originally from Eilat. <br>
      Last year I studied Full Stack Web Development at John Bryce Training, and since then I keep working on projects and learning new technologies.<br>
      I'm mainly focused on creating SPA'S with Angular and React, and Node.js for backend. <br>
      <br>
      My LinkedIn: https://www.linkedin.com/in/tomerhaziza/ <br>
      GitHub: https://github.com/tomerhaziza
  </p>
      <h2 class="decorated-title"><span>About the project</span></h2>
  
      <p class="page-text">
      In this project I was requested to create a website that retrieves information about crypto currencies from a given API.<br>
      In order to do that, i had to use Ajax technique to request the data from the server, and I used jQuery to manipulate the DOM and show the given data.<br>
  </p>`;

  createPage('about', content);
}

function createSpinner(appendTo) { // Progress bar
  $(appendTo).append('<div class="spinner">')
}

$('.scroll').click(function () { // Arrows scroll down to main content
  $('html, body').animate({
    scrollTop: $('.nav-section').offset().top
  }, 750);
});

$(".nav-btn").click(function () { // Nav bar active page
  $('.nav-btn').removeClass('active');
  $(this).addClass("active");
  $('.nav-btn').prop('disabled', false);
  $(this).prop('disabled', true);
});

$('.search-input').keypress(function (e) { // Click enter to search key
  if (e.which == 13) {
    $(this).blur();
    $('.search-btn').focus().click();
  }
});