<script>
  export let message = "Please login to enroll";
</script>

<div class="modal is-active">
  <div class="modal-background" />
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Information</p>
      <button class="delete" on:click aria-label="close" />
    </header>
    <section class="modal-card-body">{message}</section>
    <footer class="modal-card-foot">
      <button on:click class="button">Close</button>
    </footer>
  </div>
</div>
