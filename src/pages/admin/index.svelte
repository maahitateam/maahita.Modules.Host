<script>
  import axios from "axios";
  import { onMount } from "svelte";
  import {
    apihost,
    appModules,
    getAuthHeaders,
    getDateParts,
    hasKey,
  } from "../../config";

  import {
    presenters,
    presenter_sessions,
    isAdmin,
    token,
    current_presenter,
  } from "../../store";

  import TitleBar from "../components/title.svelte";
  import ProgressBar from "../components/progressbar.svelte";
  import SessionCard from "../components/sessioncard.svelte";
  import PresenterCard from "../components/presentercard.svelte";
  import AddPresenterView from "../components/addpresenter.svelte";
  import AddSessionView from "../components/addsession.svelte";
  import UnAuthorizedView from "../components/unauthorized.svelte";
  import Meeting from "../components/meeting.svelte";
  import Notify from "../components/notify.svelte";

  $: cssClasses = ["column"];
  $: notifyConfig = {};

  let module_config = {
    is_presenter_sessions_loading: false,
    is_loading: false,
    show_presenter_info: false,
    progres_bar_message: "",
    current_session: {},
    add_new_presenter: false,
    show_add_session: false,
    show_notification: false,
  };

  onMount(async () => {
    if ($isAdmin) {
      module_config.is_loading = true;
      const url = `${apihost}/${appModules.presenter}`;
      const headers = getAuthHeaders($token);
      const result = await axios.get(url, headers);
      $presenters = await result.data;
      module_config.is_loading = false;
    }
  });
  // the event is a dispatch event coming from component
  const handleAddSession = async (event) => {
    try {
      const sessiondata = event.detail; // dispatch event data is avaible in event.detail
      notifyConfig = {
        cssClass: "is-info",
      };
      if (sessiondata.isadd) {
        const temp = [...$presenter_sessions, sessiondata];
        $presenter_sessions = temp
          .map((data) => getDateParts(data, "scheduledon"))
          .sort(
            (a, b) => new Date(b["scheduledon"]) - new Date(a["scheduledon"])
          );
        notifyConfig["message"] = `${sessiondata.title} is added`;
      } else {
        // update one item in the list
        const filter = $presenter_sessions.filter(
          (s) => sessiondata.id !== s.id
        );
        $presenter_sessions = [];
        $presenter_sessions = [...filter, sessiondata]
          .map((data) => getDateParts(data, "scheduledon"))
          .sort(
            (a, b) => new Date(b["scheduledon"]) - new Date(a["scheduledon"])
          );
        notifyConfig["message"] = `${sessiondata.title} is updated`;
      }
      module_config.current_session = {};
      module_config.show_add_session = false;
      module_config.show_notification = true;
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddPresenter = async (event) => {
    try {
      const presenter = event.detail; // dispatch event data is avaible in event.detail
      const url = `${apihost}/${appModules.presenter}`;
      presenter.status = 1;
      const result = await axios
        .post(url, presenter, getAuthHeaders($token))
        .then((res) => res.data);
      $presenters = [...$presenters, result];
    } catch (error) {
      console.log(error);
    }
  };

  const addpresenter = async () => {
    $current_presenter = {};
    cssClasses.push("is-half");
    module_config.add_new_presenter = true;
    module_config.progres_bar_message = "Loading add presenter";
  };

  const view_presenter_info = async (presenter) => {
    try {
      $current_presenter = {};
      $current_presenter = presenter;
      module_config.show_add_session = false;
      module_config.show_presenter_info = true;
      module_config.is_presenter_sessions_loading = true;
      module_config.progres_bar_message = `${$current_presenter.displayName} sessions`;
      const url = `${apihost}/${appModules.session}/createdby/${presenter.id}`;
      const headers = getAuthHeaders($token);
      const result = await axios.get(url, headers).then((res) => res.data);
      $presenter_sessions = result
        .map((data) => getDateParts(data, "scheduledon"))
        .sort(
          (a, b) => new Date(b["scheduledon"]) - new Date(a["scheduledon"])
        );
      module_config.is_presenter_sessions_loading = false;
    } catch (error) {
      console.log(error);
    }
  };

  const addsession = () => {
    module_config.show_add_session = true;
    module_config.current_session = {};
  };

  const closeAddPresenter = async () => {
    try {
      const close = event.detail;
      if (close && $isAdmin) {
        module_config.add_new_presenter = false;
        $current_presenter = {};
      }
    } catch (error) {}
  };

  const closeaddsession = async () => {
    const close = event.detail;
    if (close) {
      module_config.show_add_session = false;
      module_config.current_session = {};
    }
  };

  const goback = async () => {
    module_config.show_presenter_info = false;
    $current_presenter = {};
  };

  const handlecanelsession = async (event) => {
    const data = event.detail;
    notifyConfig = {
      cssClass: "is-info",
      message: `${data.title} is cancelled`,
    };
    module_config.show_notification = true;
    console.log(data);
  };
  const handlestartsession = async (event) => {
    const data = event.detail;
    notifyConfig = {
      cssClass: "is-info",
      message: `${data.title} is started`,
    };
    module_config.show_notification = true;
    console.log(data);
  };
  const handlestopsession = async (event) => {
    const data = event.detail;
    notificyConfig = {
      cssClass: "is-info",
      message: `${data.title} is stopped`,
    };
    module_config.show_notification = true;
    console.log(data);
  };
  const handleeditsession = (event) => {
    module_config.current_session = { ...event.detail };
    notifyConfig = {
      cssClass: "is-info",
      message: `${module_config.current_session.title} is updated`,
    };
    module_config.show_notification = true;
    module_config.show_add_session = true;
  };
  const handledeletesession = (event) => {
    const data = event.detail;
    $presenter_sessions = $presenter_sessions.filter((s) => s.id !== data.id);
    notifyConfig = {
      cssClass: "is-info",
      message: `${data.title} is deleted`,
    };
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

{#if $isAdmin}
  {#if module_config.is_loading}
    <div class="container">
      <ProgressBar module="presenters" />
    </div>
  {:else}
    <div
      class="columns"
      style="padding-left: 2rem;padding-right: 2rem;padding-top:2rem;">
      {#if !module_config.show_presenter_info}
        <div class={cssClasses.join(' ')}>
          <div
            style="display: flex;justify-content:
            space-evenly;align-items:center;">
            <div>
              <TitleBar message="Active presenters in maahita" />
            </div>
            <div>
              <button on:click={addpresenter} class="button is-primary">
                <span>
                  <i class="fas fa-user" />
                </span>
                <span>&nbsp;Add Presenter</span>
              </button>
            </div>
          </div>
          <div class="grid">
            <div class="grid-container container">
              {#each $presenters as presenter}
                <PresenterCard
                  current={$current_presenter}
                  on:click={() => view_presenter_info(presenter)}
                  data={presenter} />
              {/each}
            </div>
          </div>
        </div>
        {#if module_config.add_new_presenter}
          <div class={cssClasses.join(' ')}>
            <AddPresenterView
              on:closeAddPresenter={closeAddPresenter}
              presenterdata={$current_presenter}
              on:submitpresenter={handleAddPresenter}
              admin="true"
              add="true"
              close="true"
              edit="false" />
          </div>
        {/if}
      {:else}
        <div class="column is-half">
          <div class="back">
            <button on:click={goback} class="button is-text">Go Back</button>
          </div>
          <AddPresenterView
            presenterdata={$current_presenter}
            on:submitpresenter={handleAddPresenter}
            admin="true"
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
                <button on:click={addsession} class="button is-primary">
                  <span>
                    <i class="fas fa-plus-square" />
                  </span>
                  <span>&nbsp;Add a Session</span>
                </button>
              </div>
            </div>
            {#if module_config.show_add_session}
              <AddSessionView
                add={hasKey(module_config.current_session, 'id') ? 'false' : 'true'}
                edit={hasKey(module_config.current_session, 'id') ? 'true' : 'false'}
                role="admin"
                currentpresenter={$current_presenter}
                on:submitsession={handleAddSession}
                on:closeaddsession={closeaddsession}
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
