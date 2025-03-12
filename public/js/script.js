(() => {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
})();

let searchInp = document.querySelector(".search-inp");
let searchRes = document.querySelector(".search-res");

searchInp.addEventListener("input", async () => {
  const query = searchInp.value;
  const response = await fetch(`/search?query=${encodeURIComponent(query)}`);
  const results = await response.json();
  displayResults(results);
});

async function fetchAllListings() {
  const response = await fetch("/search");
  const results = await response.json();
  displayResults(results);
}

function displayResults(results) {
  searchRes.innerHTML = ""; // Clear previous results
  results.forEach((listing) => {
    const link = document.createElement("a");
    link.href = `/listings/${listing._id}`;
    link.className = "listing-link";

    const card = `
      <div class="card col listing-card">
        <img
          src="${listing.image.url}"
          class="card-img-top"
          alt="listing_image"
          style="height: 20rem"
        />
        <div class="card-img-overlay"></div>
        <div class="card-body">
          <p class="card-text">
            <b>${listing.title}<br /></b>
            &#8377;${listing.price.toLocaleString("en-IN")}/night
            <i class="tax-info">&nbsp;&nbsp;+18% GST</i>
            <br />
          </p>
        </div>
      </div>
    `;
    link.innerHTML = card;
    searchRes.appendChild(link);
  });
}

fetchAllListings();
