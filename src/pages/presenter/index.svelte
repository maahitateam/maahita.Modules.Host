<script>
  import axios from "axios";
  import { onMount } from "svelte";
  import {
    apihost,
    appModules,
    getAuthHeaders,
    hasKey,
    getDateParts,
  } from "../../config";

  import {
    loggedInUserId,
    presenter_sessions,
    token,
    current_presenter,
    isPresenter,
  } from "../../store";

  import TitleBar from "../components/title.svelte";
  import ProgressBar from "../components/progressbar.svelte";
  import SessionCard from "../components/sessioncard.svelte";
  import AddPresenterView from "../components/addpresenter.svelte";
  import AddSessionView from "../components/addsession.svelte";
  import UnAuthorizedView from "../components/unauthorized.svelte";
  import Meeting from "../components/meeting.svelte";
  import Notify from "../components/notify.svelte";

  $: cssClasses = ["column"];
  $: notifyConfig = {
    cssClass: "is-info",
  };

  let module_config = {
    is_presenter_sessions_loading: false,
    isLoading: false,
    show_presenter_info: false,
    progres_bar_message: "",
    current_session: {},
    show_add_session: false,
    show_notification: false,
  };

  onMount(async () => {
    module_config.isLoading = true;
    const uid = $loggedInUserId;
    const url = `${apihost}/${appModules.presenter}/${uid}`;
    const headers = getAuthHeaders($token);
    $current_presenter = await axios.get(url, headers).then((res) => res.data);
    module_config.isLoading = false;
    module_config.show_presenter_info = true;
    load_presenter_sessions();
  });

  const load_presenter_sessions = async () => {
    module_config.is_presenter_sessions_loading = true;
    const uid = $loggedInUserId;
    const url = `${apihost}/${appModules.session}/createdby/${uid}`;
    const headers = getAuthHeaders($token);
    const result = await axios.get(url, headers).then((res) => res.data);
    $presenter_sessions = result
      .map((data) => getDateParts(data, "scheduledon"))
      .sort((a, b) => new Date(b["scheduledon"]) - new Date(a["scheduledon"]));
    module_config.is_presenter_sessions_loading = false;
  };

  // the event is a dispatch event coming from component
  const handleAddPresenter = async (event) => {
    try {
      const presenter = event.detail; // dispatch event data is avaible in event.detail
      const url = `${apihost}/${appModules.presenter}`;
      presenter.status = 1;
      const result = await axios
        .post(url, presenter, getAuthHeaders($token))
        .then((res) => res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const addrequest = () => {
    module_config.show_add_session = true;
  };

  const closeaddsession = async () => {
    const close = event.detail;
    if (close) {
      module_config.show_add_session = false;
      module_config.current_session = {};
    }
  };
  const handlecanelsession = async (event) => {
    const data = event.detail;
    console.log(data);
  };
  const handlestartsession = async (event) => {
    const data = event.detail;
    console.log(data);
  };
  const handlestopsession = async (event) => {
    const data = event.detail;
    console.log(data);
  };
  const handleeditsession = (event) => {
    module_config.current_session = { ...event.detail };
    module_config.show_add_session = true;
  };
  const handledeletesession = (event) => {
    const session = event.detail;
    $presenter_sessions = $presenter_sessions.filter(
      (s) => s.id !== session.id
    );
  };
  const submitrequest = (event) => {
    const data = event.detail;
    notifyConfig = {
      ...notifyConfig,
      message: `Request submitted for ${data.title}`,
    };
    module_config.show_add_session = false;
    module_config.show_notification = true;
  };
  const closenotify = () => {
    module_config.show_notification = false;
  };
</script>

<style>
  .container {
    padding-top: 32px;
  }
  .grid-container {
    padding: 10px;
    display: grid;
    grid-gap: 20px;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
  .grid {
    max-height: 84vh;
    overflow: auto;
  }
</style>

{#if $isPresenter}
  {#if module_config.isLoading}
    <div class="container">
      <ProgressBar module="loading presenter data" />
    </div>
  {:else}
    <div
      class="columns"
      style="padding-left: 2rem;padding-right: 2rem;padding-top:2rem;">
      {#if !module_config.show_presenter_info}
        <div class={cssClasses.join(' ')}>
          <div
            style="display: flex;justify-content: space-evenly;align-items:
            center;">
            <div>
              <TitleBar message="Active presenters in maahita" />
            </div>
          </div>
        </div>
      {:else}
        <div class="column is-half">
          <AddPresenterView
            presenterdata={$current_presenter}
            on:submitpresenter={handleAddPresenter}
            admin="false"
            add="false"
            close="false"
            edit="true" />
        </div>
        <div class="column is-half">
          {#if module_config.is_presenter_sessions_loading}
            <ProgressBar module={module_config.progres_bar_message} />
          {:else}
            <div style="display:flex; justify-content:space-between;">
              <div>
                <TitleBar message={module_config.progres_bar_message} />
              </div>
              <div>
                <button on:click={addrequest} class="button is-primary">
                  <span>
                    <i class="far fa-plus-square" />
                  </span>
                  <span>&nbsp;Request a Session</span>
                </button>
              </div>
            </div>
            {#if module_config.show_add_session}
              <AddSessionView
                add={hasKey(module_config.current_session, 'id') ? 'false' : 'true'}
                edit={hasKey(module_config.current_session, 'id') ? 'true' : 'false'}
                currentpresenter={$current_presenter}
                on:closeaddsession={closeaddsession}
                on:submitrequest={submitrequest}
                sessiondata={module_config.current_session} />
            {/if}
            {#if $presenter_sessions.length > 0}
              <div class="box">
                {#each $presenter_sessions as session}
                  <SessionCard
                    on:editsession={handleeditsession}
                    on:canelsession={handlecanelsession}
                    on:startsession={handlestartsession}
                    on:stopsession={handlestopsession}
                    on:deletesession={handledeletesession}
                    data={session}
                    role="presenter" />
                {/each}
              </div>
            {:else}
              <div class="box">
                <TitleBar message="create sessions to spread the knowledge" />
              </div>
            {/if}
          {/if}
        </div>
      {/if}
    </div>
    <Meeting />
    {#if module_config.show_notification}
      <Notify on:closenotify={closenotify} config={notifyConfig} />
    {/if}
  {/if}
{:else}
  <div>
    <UnAuthorizedView message="You are not authorized to view the content" />
  </div>
{/if}
