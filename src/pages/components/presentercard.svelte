<script>
  export let data;
  export let current;
</script>

<style>
  .card-image {
    text-align: center;
    padding-top: 15px;
  }

  .profilepic {
    font-size: 5rem;
    text-align: center;
  }
  .card-content {
    text-align: center;
  }
  .card {
    cursor: pointer;
  }
  .active {
    border: solid 2px #3273dc;
  }
  .profile {
    border-radius: 50%;
    height: 210px;
    width: 210px;
  }
</style>

<article
  class:active={current.id === data.id}
  id={data.id}
  class="grid-item bd"
  on:click>
  <div class="card">
    <div class="card-image">
      <figure class="figure profilepic">
        {#if data.photoURL}
          <img src={data.photoURL} class="profile" alt="" />
        {:else}
          <span>
            <i class="far fa-3x fa-user-circle" />
          </span>
        {/if}

      </figure>
    </div>
    <div class="card-content">
      <div class="media">
        <div class="media-content">
          <p class="title is-4">{data.displayName}</p>
          <p class="subtitle is-6">{data.email}</p>
        </div>
      </div>
    </div>
  </div>
</article>
