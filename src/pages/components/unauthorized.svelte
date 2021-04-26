<script>
  import TitleBar from "./title.svelte";
  export let message = "you are not authorized to view the content";
  export let iserror = true;
  let src = "/images/logo.png";
</script>

<style>
  .card {
    padding: 10px;
    width: 50%;
    margin: 80px auto;
  }
  .image {
    height: 150px;
    width: 120px;
    margin: 50px auto;
  }
</style>

<div class="card">
  <div class="card-image">
    <figure class="image">
      <img {src} alt="maahita logo" />
    </figure>
  </div>
  <div class="card-content">
    <div class="content">
      <TitleBar {iserror} {message} />
    </div>
  </div>
</div>
