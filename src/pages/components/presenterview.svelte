<script>
  import PresenterDataView from "./addpresenter.svelte";
  import SessionView from "./sessioncard.svelte";
  import axios from "axios";
  import { onMount } from "svelte";
  import {
    apihost,
    appModules,
    getAuthHeaders,
    getDateParts,
  } from "../../config";
  import { presenters, presenter_sessions, isAdmin, token } from "../../store";
  import TitleBar from "../components/title.svelte";
  import ProgressBar from "../components/progressbar.svelte";
  let is_presenter_sessions_loading = false;
  let isLoading = false;
  let current_presenter = {};
  let cssClasses = ["column"];
  let show_presenter_sessions = false;
  let show_add_presenter = false;
  let progres_bar_message = "";
</script>

{#if isAdmin}
  {#if isLoading}
    <div class="container">
      <ProgressBar module="presenters" />
    </div>
  {:else}
    <TitleBar message="Loading persenter information" />
    <div class="columns" style="padding-left: 2rem;padding-right: 2rem;">
      <div class={cssClasses.join(' ')}>
        <div class="grid-container">
          <PresenterDataView />
        </div>
      </div>
      {#if show_presenter_sessions}
        <div class={cssClasses.join(' ')}>
          {#if is_presenter_sessions_loading}
            <ProgressBar module={progres_bar_message} />
          {:else}
            <div>
              <TitleBar message={progres_bar_message} />
            </div>
            {#each $presenter_sessions as session}
              <SessionView data={session} role="presenter" />
            {/each}
          {/if}
        </div>
      {/if}
    </div>
  {/if}
{:else}
  <div class="is-danger">You are authorized to view the content</div>
{/if}

<!-- This componet provide presenter info, presenter sessions -->
