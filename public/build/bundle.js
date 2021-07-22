
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_node(node) {
        if (!node)
            return document;
        return (node.getRootNode ? node.getRootNode() : node.ownerDocument); // check for getRootNode because IE is still supported
    }
    function get_root_for_styles(node) {
        const root = get_root_for_node(node);
        return root.host ? root : root;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_styles(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_node(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init$1(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.40.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const MATCH_PARAM = RegExp(/\:([^/()]+)/g);

    function handleScroll (element) {
      if (navigator.userAgent.includes('jsdom')) return false
      scrollAncestorsToTop(element);
      handleHash();
    }

    function handleHash () {
      if (navigator.userAgent.includes('jsdom')) return false
      const { hash } = window.location;
      if (hash) {
        const validElementIdRegex = /^[A-Za-z]+[\w\-\:\.]*$/;
        if (validElementIdRegex.test(hash.substring(1))) {
          const el = document.querySelector(hash);
          if (el) el.scrollIntoView();
        }
      }
    }

    function scrollAncestorsToTop (element) {
      if (
        element &&
        element.scrollTo &&
        element.dataset.routify !== 'scroll-lock' &&
        element.dataset['routify-scroll'] !== 'lock'
      ) {
        element.style['scroll-behavior'] = 'auto';
        element.scrollTo({ top: 0, behavior: 'auto' });
        element.style['scroll-behavior'] = '';
        scrollAncestorsToTop(element.parentElement);
      }
    }

    const pathToRegex = (str, recursive) => {
      const suffix = recursive ? '' : '/?$'; //fallbacks should match recursively
      str = str.replace(/\/_fallback?$/, '(/|$)');
      str = str.replace(/\/index$/, '(/index)?'); //index files should be matched even if not present in url
      str = str.replace(MATCH_PARAM, '([^/]+)') + suffix;
      return str
    };

    const pathToParamKeys = string => {
      const paramsKeys = [];
      let matches;
      while ((matches = MATCH_PARAM.exec(string))) paramsKeys.push(matches[1]);
      return paramsKeys
    };

    const pathToRank = ({ path }) => {
      return path
        .split('/')
        .filter(Boolean)
        .map(str => (str === '_fallback' ? 'A' : str.startsWith(':') ? 'B' : 'C'))
        .join('')
    };

    let warningSuppressed = false;

    /* eslint no-console: 0 */
    function suppressWarnings () {
      if (warningSuppressed) return
      const consoleWarn = console.warn;
      console.warn = function (msg, ...msgs) {
        const ignores = [
          "was created with unknown prop 'scoped'",
          "was created with unknown prop 'scopedSync'",
        ];
        if (!ignores.find(iMsg => msg.includes(iMsg)))
          return consoleWarn(msg, ...msgs)
      };
      warningSuppressed = true;
    }

    function currentLocation () {
      const pathMatch = window.location.search.match(/__routify_path=([^&]+)/);
      const prefetchMatch = window.location.search.match(/__routify_prefetch=\d+/);
      window.routify = window.routify || {};
      window.routify.prefetched = prefetchMatch ? true : false;
      const path = pathMatch && pathMatch[1].replace(/[#?].+/, ''); // strip any thing after ? and #
      return path || window.location.pathname
    }

    window.routify = window.routify || {};

    /** @type {import('svelte/store').Writable<RouteNode>} */
    const route = writable(null); // the actual route being rendered

    /** @type {import('svelte/store').Writable<RouteNode[]>} */
    const routes$1 = writable([]); // all routes
    routes$1.subscribe(routes => (window.routify.routes = routes));

    let rootContext = writable({ component: { params: {} } });

    /** @type {import('svelte/store').Writable<RouteNode>} */
    const urlRoute = writable(null);  // the route matching the url

    /** @type {import('svelte/store').Writable<String>} */
    const basepath = (() => {
        const { set, subscribe } = writable("");

        return {
            subscribe,
            set(value) {
                if (value.match(/^[/(]/))
                    set(value);
                else console.warn('Basepaths must start with / or (');
            },
            update() { console.warn('Use assignment or set to update basepaths.'); }
        }
    })();

    const location$1 = derived( // the part of the url matching the basepath
        [basepath, urlRoute],
        ([$basepath, $route]) => {
            const [, base, path] = currentLocation().match(`^(${$basepath})(${$route.regex})`) || [];
            return { base, path }
        }
    );

    const prefetchPath = writable("");

    function onAppLoaded({ path, metatags }) {
        metatags.update();
        const prefetchMatch = window.location.search.match(/__routify_prefetch=(\d+)/);
        const prefetchId = prefetchMatch && prefetchMatch[1];

        dispatchEvent(new CustomEvent('app-loaded'));
        parent.postMessage({
            msg: 'app-loaded',
            prefetched: window.routify.prefetched,
            path,
            prefetchId
        }, "*");
        window['routify'].appLoaded = true;
    }

    var defaultConfig = {
        queryHandler: {
            parse: search => fromEntries(new URLSearchParams(search)),
            stringify: params => '?' + (new URLSearchParams(params)).toString()
        }
    };


    function fromEntries(iterable) {
        return [...iterable].reduce((obj, [key, val]) => {
            obj[key] = val;
            return obj
        }, {})
    }

    /**
     * @param {string} url 
     * @return {ClientNode}
     */
    function urlToRoute(url) {
        /** @type {RouteNode[]} */
        const routes = get_store_value(routes$1);
        const basepath$1 = get_store_value(basepath);
        const route = routes.find(route => url.match(`^${basepath$1}${route.regex}`));
        if (!route)
            throw new Error(
                `Route could not be found for "${url}".`
            )

        const [, base] = url.match(`^(${basepath$1})${route.regex}`);
        const path = url.slice(base.length);

        if (defaultConfig.queryHandler)
            route.params = defaultConfig.queryHandler.parse(window.location.search);

        if (route.paramKeys) {
            const layouts = layoutByPos(route.layouts);
            const fragments = path.split('/').filter(Boolean);
            const routeProps = getRouteProps(route.path);

            routeProps.forEach((prop, i) => {
                if (prop) {
                    route.params[prop] = fragments[i];
                    if (layouts[i]) layouts[i].param = { [prop]: fragments[i] };
                    else route.param = { [prop]: fragments[i] };
                }
            });
        }

        route.leftover = url.replace(new RegExp(base + route.regex), '');

        return route
    }


    /**
     * @param {array} layouts
     */
    function layoutByPos(layouts) {
        const arr = [];
        layouts.forEach(layout => {
            arr[layout.path.split('/').filter(Boolean).length - 1] = layout;
        });
        return arr
    }


    /**
     * @param {string} url
     */
    function getRouteProps(url) {
        return url
            .split('/')
            .filter(Boolean)
            .map(f => f.match(/\:(.+)/))
            .map(f => f && f[1])
    }

    /* node_modules/@sveltech/routify/runtime/Prefetcher.svelte generated by Svelte v3.40.1 */

    const { Object: Object_1$1 } = globals;
    const file$j = "node_modules/@sveltech/routify/runtime/Prefetcher.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (93:2) {#each $actives as prefetch (prefetch.options.prefetch)}
    function create_each_block$7(key_1, ctx) {
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			iframe = element("iframe");
    			if (!src_url_equal(iframe.src, iframe_src_value = /*prefetch*/ ctx[1].url)) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "frameborder", "0");
    			attr_dev(iframe, "title", "routify prefetcher");
    			add_location(iframe, file$j, 93, 4, 2705);
    			this.first = iframe;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, iframe, anchor);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*$actives*/ 1 && !src_url_equal(iframe.src, iframe_src_value = /*prefetch*/ ctx[1].url)) {
    				attr_dev(iframe, "src", iframe_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(iframe);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(93:2) {#each $actives as prefetch (prefetch.options.prefetch)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = /*$actives*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*prefetch*/ ctx[1].options.prefetch;
    	validate_each_keys(ctx, each_value, get_each_context$7, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$7(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$7(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "id", "__routify_iframes");
    			set_style(div, "display", "none");
    			add_location(div, file$j, 91, 0, 2591);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$actives*/ 1) {
    				each_value = /*$actives*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$7, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, destroy_block, create_each_block$7, null, get_each_context$7);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const iframeNum = 2;

    const defaults$1 = {
    	validFor: 60,
    	timeout: 5000,
    	gracePeriod: 1000
    };

    /** stores and subscriptions */
    const queue = writable([]);

    const actives = derived(queue, q => q.slice(0, iframeNum));

    actives.subscribe(actives => actives.forEach(({ options }) => {
    	setTimeout(() => removeFromQueue(options.prefetch), options.timeout);
    }));

    function prefetch(path, options = {}) {
    	prefetch.id = prefetch.id || 1;

    	path = !path.href
    	? path
    	: path.href.replace(/^(?:\/\/|[^/]+)*\//, '/');

    	//replace first ? since were mixing user queries with routify queries
    	path = path.replace('?', '&');

    	options = { ...defaults$1, ...options, path };
    	options.prefetch = prefetch.id++;

    	//don't prefetch within prefetch or SSR
    	if (window.routify.prefetched || navigator.userAgent.match('jsdom')) return false;

    	// add to queue
    	queue.update(q => {
    		if (!q.some(e => e.options.path === path)) q.push({
    			url: `/__app.html?${optionsToQuery(options)}`,
    			options
    		});

    		return q;
    	});
    }

    /**
     * convert options to query string
     * {a:1,b:2} becomes __routify_a=1&routify_b=2
     * @param {defaults & {path: string, prefetch: number}} options
     */
    function optionsToQuery(options) {
    	return Object.entries(options).map(([key, val]) => `__routify_${key}=${val}`).join('&');
    }

    /**
     * @param {number|MessageEvent} idOrEvent
     */
    function removeFromQueue(idOrEvent) {
    	const id = idOrEvent.data ? idOrEvent.data.prefetchId : idOrEvent;
    	if (!id) return null;
    	const entry = get_store_value(queue).find(entry => entry && entry.options.prefetch == id);

    	// removeFromQueue is called by both eventListener and timeout,
    	// but we can only remove the item once
    	if (entry) {
    		const { gracePeriod } = entry.options;
    		const gracePromise = new Promise(resolve => setTimeout(resolve, gracePeriod));

    		const idlePromise = new Promise(resolve => {
    				window.requestIdleCallback
    				? window.requestIdleCallback(resolve)
    				: setTimeout(resolve, gracePeriod + 1000);
    			});

    		Promise.all([gracePromise, idlePromise]).then(() => {
    			queue.update(q => q.filter(q => q.options.prefetch != id));
    		});
    	}
    }

    // Listen to message from child window
    addEventListener('message', removeFromQueue, false);

    function instance$m($$self, $$props, $$invalidate) {
    	let $actives;
    	validate_store(actives, 'actives');
    	component_subscribe($$self, actives, $$value => $$invalidate(0, $actives = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Prefetcher', slots, []);
    	const writable_props = [];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Prefetcher> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		writable,
    		derived,
    		get: get_store_value,
    		iframeNum,
    		defaults: defaults$1,
    		queue,
    		actives,
    		prefetch,
    		optionsToQuery,
    		removeFromQueue,
    		$actives
    	});

    	return [$actives];
    }

    class Prefetcher extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$m, create_fragment$m, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Prefetcher",
    			options,
    			id: create_fragment$m.name
    		});
    	}
    }

    /// <reference path="../typedef.js" />

    /** @ts-check */
    /**
     * @typedef {Object} RoutifyContext
     * @prop {ClientNode} component
     * @prop {ClientNode} layout
     * @prop {any} componentFile 
     * 
     *  @returns {import('svelte/store').Readable<RoutifyContext>} */
    function getRoutifyContext() {
      return getContext('routify') || rootContext
    }

    /**
     * @callback AfterPageLoadHelper
     * @param {function} callback
     * 
     * @typedef {import('svelte/store').Readable<AfterPageLoadHelper> & {_hooks:Array<function>}} AfterPageLoadHelperStore
     * @type {AfterPageLoadHelperStore}
     */
    const afterPageLoad = {
      _hooks: [],
      subscribe: hookHandler
    };

    /** 
     * @callback BeforeUrlChangeHelper
     * @param {function} callback
     *
     * @typedef {import('svelte/store').Readable<BeforeUrlChangeHelper> & {_hooks:Array<function>}} BeforeUrlChangeHelperStore
     * @type {BeforeUrlChangeHelperStore}
     **/
    const beforeUrlChange = {
      _hooks: [],
      subscribe: hookHandler
    };

    function hookHandler(listener) {
      const hooks = this._hooks;
      const index = hooks.length;
      listener(callback => { hooks[index] = callback; });
      return () => delete hooks[index]
    }

    /**
     * @callback UrlHelper
     * @param {String=} path
     * @param {UrlParams=} params
     * @param {UrlOptions=} options
     * @return {String}
     *
     * @typedef {import('svelte/store').Readable<UrlHelper>} UrlHelperStore
     * @type {UrlHelperStore} 
     * */
    const url = {
      subscribe(listener) {
        const ctx = getRoutifyContext();
        return derived(
          [ctx, route, routes$1, location$1],
          args => makeUrlHelper(...args)
        ).subscribe(
          listener
        )
      }
    };

    /** 
     * @param {{component: ClientNode}} $ctx 
     * @param {RouteNode} $oldRoute 
     * @param {RouteNode[]} $routes 
     * @param {{base: string, path: string}} $location
     * @returns {UrlHelper}
     */
    function makeUrlHelper($ctx, $oldRoute, $routes, $location) {
      return function url(path, params, options) {
        const { component } = $ctx;
        path = path || './';

        const strict = options && options.strict !== false;
        if (!strict) path = path.replace(/index$/, '');

        if (path.match(/^\.\.?\//)) {
          //RELATIVE PATH
          let [, breadcrumbs, relativePath] = path.match(/^([\.\/]+)(.*)/);
          let dir = component.path.replace(/\/$/, '');
          const traverse = breadcrumbs.match(/\.\.\//g) || [];
          traverse.forEach(() => dir = dir.replace(/\/[^\/]+\/?$/, ''));
          path = `${dir}/${relativePath}`.replace(/\/$/, '');

        } else if (path.match(/^\//)) ; else {
          // NAMED PATH
          const matchingRoute = $routes.find(route => route.meta.name === path);
          if (matchingRoute) path = matchingRoute.shortPath;
        }

        /** @type {Object<string, *>} Parameters */
        const allParams = Object.assign({}, $oldRoute.params, component.params, params);
        let pathWithParams = path;
        for (const [key, value] of Object.entries(allParams)) {
          pathWithParams = pathWithParams.replace(`:${key}`, value);
        }

        const fullPath = $location.base + pathWithParams + _getQueryString(path, params);
        return fullPath.replace(/\?$/, '')
      }
    }

    /**
     * 
     * @param {string} path 
     * @param {object} params 
     */
    function _getQueryString(path, params) {
      if (!defaultConfig.queryHandler) return ""
      const pathParamKeys = pathToParamKeys(path);
      const queryParams = {};
      if (params) Object.entries(params).forEach(([key, value]) => {
        if (!pathParamKeys.includes(key))
          queryParams[key] = value;
      });
      return defaultConfig.queryHandler.stringify(queryParams)
    }

    /**
    * @callback GotoHelper
    * @param {String=} path
    * @param {UrlParams=} params
    * @param {GotoOptions=} options
    *
    * @typedef {import('svelte/store').Readable<GotoHelper>}  GotoHelperStore
    * @type {GotoHelperStore} 
    * */
    const goto = {
      subscribe(listener) {
        return derived(url,
          url => function goto(path, params, _static, shallow) {
            const href = url(path, params);
            if (!_static) history.pushState({}, null, href);
            else getContext('routifyupdatepage')(href, shallow);
          }
        ).subscribe(
          listener
        )
      },
    };

    /**
     * @type {GotoHelperStore} 
     * */
    const redirect = {
      subscribe(listener) {
        return derived(url,
          url => function redirect(path, params, _static, shallow) {
            const href = url(path, params);
            if (!_static) history.replaceState({}, null, href);
            else getContext('routifyupdatepage')(href, shallow);
          }
        ).subscribe(
          listener
        )
      },
    };



    const _metatags = {
      props: {},
      templates: {},
      services: {
        plain: { propField: 'name', valueField: 'content' },
        twitter: { propField: 'name', valueField: 'content' },
        og: { propField: 'property', valueField: 'content' },
      },
      plugins: [
        {
          name: 'applyTemplate',
          condition: () => true,
          action: (prop, value) => {
            const template = _metatags.getLongest(_metatags.templates, prop) || (x => x);
            return [prop, template(value)]
          }
        },
        {
          name: 'createMeta',
          condition: () => true,
          action(prop, value) {
            _metatags.writeMeta(prop, value);
          }
        },
        {
          name: 'createOG',
          condition: prop => !prop.match(':'),
          action(prop, value) {
            _metatags.writeMeta(`og:${prop}`, value);
          }
        },
        {
          name: 'createTitle',
          condition: prop => prop === 'title',
          action(prop, value) {
            document.title = value;
          }
        }
      ],
      getLongest(repo, name) {
        const providers = repo[name];
        if (providers) {
          const currentPath = get_store_value(route).path;
          const allPaths = Object.keys(repo[name]);
          const matchingPaths = allPaths.filter(path => currentPath.includes(path));

          const longestKey = matchingPaths.sort((a, b) => b.length - a.length)[0];

          return providers[longestKey]
        }
      },
      writeMeta(prop, value) {
        const head = document.getElementsByTagName('head')[0];
        const match = prop.match(/(.+)\:/);
        const serviceName = match && match[1] || 'plain';
        const { propField, valueField } = metatags.services[serviceName] || metatags.services.plain;
        const oldElement = document.querySelector(`meta[${propField}='${prop}']`);
        if (oldElement) oldElement.remove();

        const newElement = document.createElement('meta');
        newElement.setAttribute(propField, prop);
        newElement.setAttribute(valueField, value);
        newElement.setAttribute('data-origin', 'routify');
        head.appendChild(newElement);
      },
      set(prop, value) {
        _metatags.plugins.forEach(plugin => {
          if (plugin.condition(prop, value))
            [prop, value] = plugin.action(prop, value) || [prop, value];
        });
      },
      clear() {
        const oldElement = document.querySelector(`meta`);
        if (oldElement) oldElement.remove();
      },
      template(name, fn) {
        const origin = _metatags.getOrigin();
        _metatags.templates[name] = _metatags.templates[name] || {};
        _metatags.templates[name][origin] = fn;
      },
      update() {
        Object.keys(_metatags.props).forEach((prop) => {
          let value = (_metatags.getLongest(_metatags.props, prop));
          _metatags.plugins.forEach(plugin => {
            if (plugin.condition(prop, value)) {
              [prop, value] = plugin.action(prop, value) || [prop, value];

            }
          });
        });
      },
      batchedUpdate() {
        if (!_metatags._pendingUpdate) {
          _metatags._pendingUpdate = true;
          setTimeout(() => {
            _metatags._pendingUpdate = false;
            this.update();
          });
        }
      },
      _updateQueued: false,
      getOrigin() {
        const routifyCtx = getRoutifyContext();
        return routifyCtx && get_store_value(routifyCtx).path || '/'
      },
      _pendingUpdate: false
    };


    /**
     * metatags
     * @prop {Object.<string, string>}
     */
    const metatags = new Proxy(_metatags, {
      set(target, name, value, receiver) {
        const { props, getOrigin } = target;

        if (Reflect.has(target, name))
          Reflect.set(target, name, value, receiver);
        else {
          props[name] = props[name] || {};
          props[name][getOrigin()] = value;
        }

        if (window['routify'].appLoaded)
          target.batchedUpdate();
        return true
      }
    });

    ((function () {
      const store = writable(false);
      beforeUrlChange.subscribe(fn => fn(event => {
        store.set(true);
        return true
      }));
      
      afterPageLoad.subscribe(fn => fn(event => store.set(false)));

      return store
    }))();

    /* node_modules/@sveltech/routify/runtime/Route.svelte generated by Svelte v3.40.1 */
    const file$i = "node_modules/@sveltech/routify/runtime/Route.svelte";

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i].component;
    	child_ctx[20] = list[i].componentFile;
    	return child_ctx;
    }

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i].component;
    	child_ctx[20] = list[i].componentFile;
    	return child_ctx;
    }

    // (120:0) {#if $context}
    function create_if_block_1$a(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2$9, create_if_block_3$6];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$context*/ ctx[6].component.isLayout === false) return 0;
    		if (/*remainingLayouts*/ ctx[5].length) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$a.name,
    		type: "if",
    		source: "(120:0) {#if $context}",
    		ctx
    	});

    	return block;
    }

    // (132:36) 
    function create_if_block_3$6(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value_1 = [/*$context*/ ctx[6]];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*component*/ ctx[19].path;
    	validate_each_keys(ctx, each_value_1, get_each_context_1$1, get_key);

    	for (let i = 0; i < 1; i += 1) {
    		let child_ctx = get_each_context_1$1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$context, scoped, scopedSync, layout, remainingLayouts, decorator, Decorator, scopeToChild*/ 100663407) {
    				each_value_1 = [/*$context*/ ctx[6]];
    				validate_each_argument(each_value_1);
    				group_outros();
    				validate_each_keys(ctx, each_value_1, get_each_context_1$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block_1$1, each_1_anchor, get_each_context_1$1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < 1; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 1; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$6.name,
    		type: "if",
    		source: "(132:36) ",
    		ctx
    	});

    	return block;
    }

    // (121:2) {#if $context.component.isLayout === false}
    function create_if_block_2$9(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = [/*$context*/ ctx[6]];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*component*/ ctx[19].path;
    	validate_each_keys(ctx, each_value, get_each_context$6, get_key);

    	for (let i = 0; i < 1; i += 1) {
    		let child_ctx = get_each_context$6(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$6(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$context, scoped, scopedSync, layout*/ 77) {
    				each_value = [/*$context*/ ctx[6]];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$6, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$6, each_1_anchor, get_each_context$6);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < 1; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 1; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$9.name,
    		type: "if",
    		source: "(121:2) {#if $context.component.isLayout === false}",
    		ctx
    	});

    	return block;
    }

    // (134:6) <svelte:component         this={componentFile}         let:scoped={scopeToChild}         let:decorator         {scoped}         {scopedSync}         {...layout.param || {}}>
    function create_default_slot(ctx) {
    	let route_1;
    	let t;
    	let current;

    	route_1 = new Route({
    			props: {
    				layouts: [.../*remainingLayouts*/ ctx[5]],
    				Decorator: typeof /*decorator*/ ctx[26] !== 'undefined'
    				? /*decorator*/ ctx[26]
    				: /*Decorator*/ ctx[1],
    				childOfDecorator: /*layout*/ ctx[2].isDecorator,
    				scoped: {
    					.../*scoped*/ ctx[0],
    					.../*scopeToChild*/ ctx[25]
    				}
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route_1.$$.fragment);
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			mount_component(route_1, target, anchor);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route_1_changes = {};
    			if (dirty & /*remainingLayouts*/ 32) route_1_changes.layouts = [.../*remainingLayouts*/ ctx[5]];

    			if (dirty & /*decorator, Decorator*/ 67108866) route_1_changes.Decorator = typeof /*decorator*/ ctx[26] !== 'undefined'
    			? /*decorator*/ ctx[26]
    			: /*Decorator*/ ctx[1];

    			if (dirty & /*layout*/ 4) route_1_changes.childOfDecorator = /*layout*/ ctx[2].isDecorator;

    			if (dirty & /*scoped, scopeToChild*/ 33554433) route_1_changes.scoped = {
    				.../*scoped*/ ctx[0],
    				.../*scopeToChild*/ ctx[25]
    			};

    			route_1.$set(route_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route_1, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(134:6) <svelte:component         this={componentFile}         let:scoped={scopeToChild}         let:decorator         {scoped}         {scopedSync}         {...layout.param || {}}>",
    		ctx
    	});

    	return block;
    }

    // (133:4) {#each [$context] as { component, componentFile }
    function create_each_block_1$1(key_1, ctx) {
    	let first;
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ scoped: /*scoped*/ ctx[0] },
    		{ scopedSync: /*scopedSync*/ ctx[3] },
    		/*layout*/ ctx[2].param || {}
    	];

    	var switch_value = /*componentFile*/ ctx[20];

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: {
    				default: [
    					create_default_slot,
    					({ scoped: scopeToChild, decorator }) => ({ 25: scopeToChild, 26: decorator }),
    					({ scoped: scopeToChild, decorator }) => (scopeToChild ? 33554432 : 0) | (decorator ? 67108864 : 0)
    				]
    			},
    			$$scope: { ctx }
    		};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			const switch_instance_changes = (dirty & /*scoped, scopedSync, layout*/ 13)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*scoped*/ 1 && { scoped: /*scoped*/ ctx[0] },
    					dirty & /*scopedSync*/ 8 && { scopedSync: /*scopedSync*/ ctx[3] },
    					dirty & /*layout*/ 4 && get_spread_object(/*layout*/ ctx[2].param || {})
    				])
    			: {};

    			if (dirty & /*$$scope, remainingLayouts, decorator, Decorator, layout, scoped, scopeToChild*/ 234881063) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*componentFile*/ ctx[20])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(133:4) {#each [$context] as { component, componentFile }",
    		ctx
    	});

    	return block;
    }

    // (122:4) {#each [$context] as { component, componentFile }
    function create_each_block$6(key_1, ctx) {
    	let first;
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ scoped: /*scoped*/ ctx[0] },
    		{ scopedSync: /*scopedSync*/ ctx[3] },
    		/*layout*/ ctx[2].param || {}
    	];

    	var switch_value = /*componentFile*/ ctx[20];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			const switch_instance_changes = (dirty & /*scoped, scopedSync, layout*/ 13)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*scoped*/ 1 && { scoped: /*scoped*/ ctx[0] },
    					dirty & /*scopedSync*/ 8 && { scopedSync: /*scopedSync*/ ctx[3] },
    					dirty & /*layout*/ 4 && get_spread_object(/*layout*/ ctx[2].param || {})
    				])
    			: {};

    			if (switch_value !== (switch_value = /*componentFile*/ ctx[20])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(122:4) {#each [$context] as { component, componentFile }",
    		ctx
    	});

    	return block;
    }

    // (152:0) {#if !parentElement}
    function create_if_block$d(ctx) {
    	let span;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			add_location(span, file$i, 152, 2, 4450);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (!mounted) {
    				dispose = action_destroyer(/*setParent*/ ctx[8].call(null, span));
    				mounted = true;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$d.name,
    		type: "if",
    		source: "(152:0) {#if !parentElement}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*$context*/ ctx[6] && create_if_block_1$a(ctx);
    	let if_block1 = !/*parentElement*/ ctx[4] && create_if_block$d(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$context*/ ctx[6]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*$context*/ 64) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$a(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!/*parentElement*/ ctx[4]) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block$d(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let $route;
    	let $context;
    	validate_store(route, 'route');
    	component_subscribe($$self, route, $$value => $$invalidate(14, $route = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Route', slots, []);
    	let { layouts = [] } = $$props;
    	let { scoped = {} } = $$props;
    	let { Decorator = null } = $$props;
    	let { childOfDecorator = false } = $$props;
    	let { isRoot = false } = $$props;
    	let scopedSync = {};
    	let isDecorator = false;

    	/** @type {HTMLElement} */
    	let parentElement;

    	/** @type {LayoutOrDecorator} */
    	let layout = null;

    	/** @type {LayoutOrDecorator} */
    	let lastLayout = null;

    	/** @type {LayoutOrDecorator[]} */
    	let remainingLayouts = [];

    	const context = writable(null);
    	validate_store(context, 'context');
    	component_subscribe($$self, context, value => $$invalidate(6, $context = value));

    	/** @type {import("svelte/store").Writable<Context>} */
    	const parentContextStore = getContext('routify');

    	isDecorator = Decorator && !childOfDecorator;
    	setContext('routify', context);

    	/** @param {HTMLElement} el */
    	function setParent(el) {
    		$$invalidate(4, parentElement = el.parentElement);
    	}

    	/** @param {SvelteComponent} componentFile */
    	function onComponentLoaded(componentFile) {
    		/** @type {Context} */
    		const parentContext = get_store_value(parentContextStore);

    		$$invalidate(3, scopedSync = { ...scoped });
    		lastLayout = layout;
    		if (remainingLayouts.length === 0) onLastComponentLoaded();

    		const ctx = {
    			layout: isDecorator ? parentContext.layout : layout,
    			component: layout,
    			route: $route,
    			componentFile,
    			child: isDecorator
    			? parentContext.child
    			: get_store_value(context) && get_store_value(context).child
    		};

    		context.set(ctx);
    		if (isRoot) rootContext.set(ctx);

    		if (parentContext && !isDecorator) parentContextStore.update(store => {
    			store.child = layout || store.child;
    			return store;
    		});
    	}

    	/**  @param {LayoutOrDecorator} layout */
    	function setComponent(layout) {
    		let PendingComponent = layout.component();
    		if (PendingComponent instanceof Promise) PendingComponent.then(onComponentLoaded); else onComponentLoaded(PendingComponent);
    	}

    	async function onLastComponentLoaded() {
    		afterPageLoad._hooks.forEach(hook => hook(layout.api));
    		await tick();
    		handleScroll(parentElement);

    		if (!window['routify'].appLoaded) {
    			const pagePath = $context.component.path;
    			const routePath = $route.path;
    			const isOnCurrentRoute = pagePath === routePath; //maybe we're getting redirected

    			// Let everyone know the last child has rendered
    			if (!window['routify'].stopAutoReady && isOnCurrentRoute) {
    				onAppLoaded({ path: pagePath, metatags });
    			}
    		}
    	}

    	const writable_props = ['layouts', 'scoped', 'Decorator', 'childOfDecorator', 'isRoot'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Route> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('layouts' in $$props) $$invalidate(9, layouts = $$props.layouts);
    		if ('scoped' in $$props) $$invalidate(0, scoped = $$props.scoped);
    		if ('Decorator' in $$props) $$invalidate(1, Decorator = $$props.Decorator);
    		if ('childOfDecorator' in $$props) $$invalidate(10, childOfDecorator = $$props.childOfDecorator);
    		if ('isRoot' in $$props) $$invalidate(11, isRoot = $$props.isRoot);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onDestroy,
    		onMount,
    		tick,
    		writable,
    		get: get_store_value,
    		metatags,
    		afterPageLoad,
    		route,
    		routes: routes$1,
    		rootContext,
    		handleScroll,
    		onAppLoaded,
    		layouts,
    		scoped,
    		Decorator,
    		childOfDecorator,
    		isRoot,
    		scopedSync,
    		isDecorator,
    		parentElement,
    		layout,
    		lastLayout,
    		remainingLayouts,
    		context,
    		parentContextStore,
    		setParent,
    		onComponentLoaded,
    		setComponent,
    		onLastComponentLoaded,
    		$route,
    		$context
    	});

    	$$self.$inject_state = $$props => {
    		if ('layouts' in $$props) $$invalidate(9, layouts = $$props.layouts);
    		if ('scoped' in $$props) $$invalidate(0, scoped = $$props.scoped);
    		if ('Decorator' in $$props) $$invalidate(1, Decorator = $$props.Decorator);
    		if ('childOfDecorator' in $$props) $$invalidate(10, childOfDecorator = $$props.childOfDecorator);
    		if ('isRoot' in $$props) $$invalidate(11, isRoot = $$props.isRoot);
    		if ('scopedSync' in $$props) $$invalidate(3, scopedSync = $$props.scopedSync);
    		if ('isDecorator' in $$props) $$invalidate(12, isDecorator = $$props.isDecorator);
    		if ('parentElement' in $$props) $$invalidate(4, parentElement = $$props.parentElement);
    		if ('layout' in $$props) $$invalidate(2, layout = $$props.layout);
    		if ('lastLayout' in $$props) lastLayout = $$props.lastLayout;
    		if ('remainingLayouts' in $$props) $$invalidate(5, remainingLayouts = $$props.remainingLayouts);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*isDecorator, Decorator, layouts*/ 4610) {
    			if (isDecorator) {
    				const decoratorLayout = {
    					component: () => Decorator,
    					path: `${layouts[0].path}__decorator`,
    					isDecorator: true
    				};

    				$$invalidate(9, layouts = [decoratorLayout, ...layouts]);
    			}
    		}

    		if ($$self.$$.dirty & /*layouts*/ 512) {
    			$$invalidate(2, [layout, ...remainingLayouts] = layouts, layout, ((($$invalidate(5, remainingLayouts), $$invalidate(9, layouts)), $$invalidate(12, isDecorator)), $$invalidate(1, Decorator)));
    		}

    		if ($$self.$$.dirty & /*layout*/ 4) {
    			setComponent(layout);
    		}
    	};

    	return [
    		scoped,
    		Decorator,
    		layout,
    		scopedSync,
    		parentElement,
    		remainingLayouts,
    		$context,
    		context,
    		setParent,
    		layouts,
    		childOfDecorator,
    		isRoot,
    		isDecorator
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init$1(this, options, instance$l, create_fragment$l, safe_not_equal, {
    			layouts: 9,
    			scoped: 0,
    			Decorator: 1,
    			childOfDecorator: 10,
    			isRoot: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$l.name
    		});
    	}

    	get layouts() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set layouts(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scoped() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scoped(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Decorator() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Decorator(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get childOfDecorator() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set childOfDecorator(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isRoot() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isRoot(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function init(routes, callback) {
      /** @type { ClientNode | false } */
      let lastRoute = false;

      function updatePage(proxyToUrl, shallow) {
        const url = proxyToUrl || currentLocation();
        const route$1 = urlToRoute(url);
        const currentRoute = shallow && urlToRoute(currentLocation());
        const contextRoute = currentRoute || route$1;
        const layouts = [...contextRoute.layouts, route$1];
        if (lastRoute) delete lastRoute.last; //todo is a page component the right place for the previous route?
        route$1.last = lastRoute;
        lastRoute = route$1;

        //set the route in the store
        if (!proxyToUrl)
          urlRoute.set(route$1);
        route.set(route$1);

        //run callback in Router.svelte
        callback(layouts);
      }

      const destroy = createEventListeners(updatePage);

      return { updatePage, destroy }
    }

    /**
     * svelte:window events doesn't work on refresh
     * @param {Function} updatePage
     */
    function createEventListeners(updatePage) {
    ['pushState', 'replaceState'].forEach(eventName => {
        const fn = history[eventName];
        history[eventName] = async function (state = {}, title, url) {
          const { id, path, params } = get_store_value(route);
          state = { id, path, params, ...state };
          const event = new Event(eventName.toLowerCase());
          Object.assign(event, { state, title, url });

          if (await runHooksBeforeUrlChange(event)) {
            fn.apply(this, [state, title, url]);
            return dispatchEvent(event)
          }
        };
      });

      let _ignoreNextPop = false;

      const listeners = {
        click: handleClick,
        pushstate: () => updatePage(),
        replacestate: () => updatePage(),
        popstate: async event => {
          if (_ignoreNextPop)
            _ignoreNextPop = false;
          else {
            if (await runHooksBeforeUrlChange(event)) {
              updatePage();
            } else {
              _ignoreNextPop = true;
              event.preventDefault();
              history.go(1);
            }
          }
        },
      };

      Object.entries(listeners).forEach(args => addEventListener(...args));

      const unregister = () => {
        Object.entries(listeners).forEach(args => removeEventListener(...args));
      };

      return unregister
    }

    function handleClick(event) {
      const el = event.target.closest('a');
      const href = el && el.getAttribute('href');

      if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey ||
        event.button ||
        event.defaultPrevented
      )
        return
      if (!href || el.target || el.host !== location.host) return

      event.preventDefault();
      history.pushState({}, '', href);
    }

    async function runHooksBeforeUrlChange(event) {
      const route$1 = get_store_value(route);
      for (const hook of beforeUrlChange._hooks.filter(Boolean)) {
        // return false if the hook returns false
        const result = await hook(event, route$1); //todo remove route from hook. Its API Can be accessed as $page
        if (!result) return false
      }
      return true
    }

    /* node_modules/@sveltech/routify/runtime/Router.svelte generated by Svelte v3.40.1 */

    const { Object: Object_1 } = globals;

    // (64:0) {#if layouts && $route !== null}
    function create_if_block$c(ctx) {
    	let route_1;
    	let current;

    	route_1 = new Route({
    			props: {
    				layouts: /*layouts*/ ctx[0],
    				isRoot: true
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route_1_changes = {};
    			if (dirty & /*layouts*/ 1) route_1_changes.layouts = /*layouts*/ ctx[0];
    			route_1.$set(route_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$c.name,
    		type: "if",
    		source: "(64:0) {#if layouts && $route !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let t;
    	let prefetcher;
    	let current;
    	let if_block = /*layouts*/ ctx[0] && /*$route*/ ctx[1] !== null && create_if_block$c(ctx);
    	prefetcher = new Prefetcher({ $$inline: true });

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			create_component(prefetcher.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(prefetcher, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*layouts*/ ctx[0] && /*$route*/ ctx[1] !== null) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*layouts, $route*/ 3) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$c(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(prefetcher.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(prefetcher.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(prefetcher, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let $route;
    	validate_store(route, 'route');
    	component_subscribe($$self, route, $$value => $$invalidate(1, $route = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, []);
    	let { routes } = $$props;
    	let { config = {} } = $$props;
    	let layouts;
    	let navigator;
    	window.routify = window.routify || {};
    	window.routify.inBrowser = !window.navigator.userAgent.match('jsdom');

    	Object.entries(config).forEach(([key, value]) => {
    		defaultConfig[key] = value;
    	});

    	suppressWarnings();
    	const updatePage = (...args) => navigator && navigator.updatePage(...args);
    	setContext('routifyupdatepage', updatePage);
    	const callback = res => $$invalidate(0, layouts = res);

    	const cleanup = () => {
    		if (!navigator) return;
    		navigator.destroy();
    		navigator = null;
    	};

    	let initTimeout = null;

    	// init is async to prevent a horrible bug that completely disable reactivity
    	// in the host component -- something like the component's update function is
    	// called before its fragment is created, and since the component is then seen
    	// as already dirty, it is never scheduled for update again, and remains dirty
    	// forever... I failed to isolate the precise conditions for the bug, but the
    	// faulty update is triggered by a change in the route store, and so offseting
    	// store initialization by one tick gives the host component some time to
    	// create its fragment. The root cause it probably a bug in Svelte with deeply
    	// intertwinned store and reactivity.
    	const doInit = () => {
    		clearTimeout(initTimeout);

    		initTimeout = setTimeout(() => {
    			cleanup();
    			navigator = init(routes, callback);
    			routes$1.set(routes);
    			navigator.updatePage();
    		});
    	};

    	onDestroy(cleanup);
    	const writable_props = ['routes', 'config'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('routes' in $$props) $$invalidate(2, routes = $$props.routes);
    		if ('config' in $$props) $$invalidate(3, config = $$props.config);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		onDestroy,
    		Route,
    		Prefetcher,
    		init,
    		route,
    		routesStore: routes$1,
    		prefetchPath,
    		suppressWarnings,
    		defaultConfig,
    		routes,
    		config,
    		layouts,
    		navigator,
    		updatePage,
    		callback,
    		cleanup,
    		initTimeout,
    		doInit,
    		$route
    	});

    	$$self.$inject_state = $$props => {
    		if ('routes' in $$props) $$invalidate(2, routes = $$props.routes);
    		if ('config' in $$props) $$invalidate(3, config = $$props.config);
    		if ('layouts' in $$props) $$invalidate(0, layouts = $$props.layouts);
    		if ('navigator' in $$props) navigator = $$props.navigator;
    		if ('initTimeout' in $$props) initTimeout = $$props.initTimeout;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*routes*/ 4) {
    			if (routes) doInit();
    		}
    	};

    	return [layouts, $route, routes, config];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$k, create_fragment$k, safe_not_equal, { routes: 2, config: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$k.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*routes*/ ctx[2] === undefined && !('routes' in props)) {
    			console.warn("<Router> was created without expected prop 'routes'");
    		}
    	}

    	get routes() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get config() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set config(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /** 
     * Node payload
     * @typedef {Object} NodePayload
     * @property {RouteNode=} file current node
     * @property {RouteNode=} parent parent of the current node
     * @property {StateObject=} state state shared by every node in the walker
     * @property {Object=} scope scope inherited by descendants in the scope
     *
     * State Object
     * @typedef {Object} StateObject
     * @prop {TreePayload=} treePayload payload from the tree
     * 
     * Node walker proxy
     * @callback NodeWalkerProxy
     * @param {NodePayload} NodePayload
     */


    /**
     * Node middleware
     * @description Walks through the nodes of a tree
     * @example middleware = createNodeMiddleware(payload => {payload.file.name = 'hello'})(treePayload))
     * @param {NodeWalkerProxy} fn 
     */
    function createNodeMiddleware(fn) {

        /**    
         * NodeMiddleware payload receiver
         * @param {TreePayload} payload
         */
        const inner = async function execute(payload) {
            return await nodeMiddleware(payload.tree, fn, { state: { treePayload: payload } })
        };

        /**    
         * NodeMiddleware sync payload receiver
         * @param {TreePayload} payload
         */
        inner.sync = function executeSync(payload) {
            return nodeMiddlewareSync(payload.tree, fn, { state: { treePayload: payload } })
        };

        return inner
    }

    /**
     * Node walker
     * @param {Object} file mutable file
     * @param {NodeWalkerProxy} fn function to be called for each file
     * @param {NodePayload=} payload 
     */
    async function nodeMiddleware(file, fn, payload) {
        const { state, scope, parent } = payload || {};
        payload = {
            file,
            parent,
            state: state || {},            //state is shared by all files in the walk
            scope: clone(scope || {}),     //scope is inherited by descendants
        };

        await fn(payload);

        if (file.children) {
            payload.parent = file;
            await Promise.all(file.children.map(_file => nodeMiddleware(_file, fn, payload)));
        }
        return payload
    }

    /**
     * Node walker (sync version)
     * @param {Object} file mutable file
     * @param {NodeWalkerProxy} fn function to be called for each file
     * @param {NodePayload=} payload 
     */
    function nodeMiddlewareSync(file, fn, payload) {
        const { state, scope, parent } = payload || {};
        payload = {
            file,
            parent,
            state: state || {},            //state is shared by all files in the walk
            scope: clone(scope || {}),     //scope is inherited by descendants
        };

        fn(payload);

        if (file.children) {
            payload.parent = file;
            file.children.map(_file => nodeMiddlewareSync(_file, fn, payload));
        }
        return payload
    }


    /**
     * Clone with JSON
     * @param {T} obj 
     * @returns {T} JSON cloned object
     * @template T
     */
    function clone(obj) { return JSON.parse(JSON.stringify(obj)) }

    const setRegex = createNodeMiddleware(({ file }) => {
        if (file.isPage || file.isFallback)
            file.regex = pathToRegex(file.path, file.isFallback);
    });
    const setParamKeys = createNodeMiddleware(({ file }) => {
        file.paramKeys = pathToParamKeys(file.path);
    });

    const setShortPath = createNodeMiddleware(({ file }) => {
        if (file.isFallback || file.isIndex)
            file.shortPath = file.path.replace(/\/[^/]+$/, '');
        else file.shortPath = file.path;
    });
    const setRank = createNodeMiddleware(({ file }) => {
        file.ranking = pathToRank(file);
    });


    // todo delete?
    const addMetaChildren = createNodeMiddleware(({ file }) => {
        const node = file;
        const metaChildren = file.meta && file.meta.children || [];
        if (metaChildren.length) {
            node.children = node.children || [];
            node.children.push(...metaChildren.map(meta => ({ isMeta: true, ...meta, meta })));
        }
    });

    const setIsIndexable = createNodeMiddleware(payload => {
        const { file } = payload;
        const { isLayout, isFallback, meta } = file;
        file.isIndexable = !isLayout && !isFallback && meta.index !== false;
        file.isNonIndexable = !file.isIndexable;
    });


    const assignRelations = createNodeMiddleware(({ file, parent }) => {
        Object.defineProperty(file, 'parent', { get: () => parent });
        Object.defineProperty(file, 'nextSibling', { get: () => _getSibling(file, 1) });
        Object.defineProperty(file, 'prevSibling', { get: () => _getSibling(file, -1) });
        Object.defineProperty(file, 'lineage', { get: () => _getLineage(parent) });
    });

    function _getLineage(node, lineage = []){
        if(node){
            lineage.unshift(node);
            _getLineage(node.parent, lineage);
        }
        return lineage
    }

    /**
     * 
     * @param {RouteNode} file 
     * @param {Number} direction 
     */
    function _getSibling(file, direction) {
        if (!file.root) {
            const siblings = file.parent.children.filter(c => c.isIndexable);
            const index = siblings.indexOf(file);
            return siblings[index + direction]
        }
    }

    const assignIndex = createNodeMiddleware(({ file, parent }) => {
        if (file.isIndex) Object.defineProperty(parent, 'index', { get: () => file });
        if (file.isLayout)
            Object.defineProperty(parent, 'layout', { get: () => file });
    });

    const assignLayout = createNodeMiddleware(({ file, scope }) => {
        Object.defineProperty(file, 'layouts', { get: () => getLayouts(file) });
        function getLayouts(file) {
            const { parent } = file;
            const layout = parent && parent.layout;
            const isReset = layout && layout.isReset;
            const layouts = (parent && !isReset && getLayouts(parent)) || [];
            if (layout) layouts.push(layout);
            return layouts
        }
    });


    const createFlatList = treePayload => {
        createNodeMiddleware(payload => {
            if (payload.file.isPage || payload.file.isFallback)
            payload.state.treePayload.routes.push(payload.file);
        }).sync(treePayload);    
        treePayload.routes.sort((c, p) => (c.ranking >= p.ranking ? -1 : 1));
    };

    const setPrototype = createNodeMiddleware(({ file }) => {
        const Prototype = file.root
            ? Root
            : file.children
                ? file.isFile ? PageDir : Dir
                : file.isReset
                    ? Reset
                    : file.isLayout
                        ? Layout
                        : file.isFallback
                            ? Fallback
                            : Page;
        Object.setPrototypeOf(file, Prototype.prototype);

        function Layout() { }
        function Dir() { }
        function Fallback() { }
        function Page() { }
        function PageDir() { }
        function Reset() { }
        function Root() { }
    });

    var miscPlugins = /*#__PURE__*/Object.freeze({
        __proto__: null,
        setRegex: setRegex,
        setParamKeys: setParamKeys,
        setShortPath: setShortPath,
        setRank: setRank,
        addMetaChildren: addMetaChildren,
        setIsIndexable: setIsIndexable,
        assignRelations: assignRelations,
        assignIndex: assignIndex,
        assignLayout: assignLayout,
        createFlatList: createFlatList,
        setPrototype: setPrototype
    });

    const assignAPI = createNodeMiddleware(({ file }) => {
        file.api = new ClientApi(file);
    });

    class ClientApi {
        constructor(file) {
            this.__file = file;
            Object.defineProperty(this, '__file', { enumerable: false });
            this.isMeta = !!file.isMeta;
            this.path = file.path;
            this.title = _prettyName(file);
            this.meta = file.meta;
        }

        get parent() { return !this.__file.root && this.__file.parent.api }
        get children() {
            return (this.__file.children || this.__file.isLayout && this.__file.parent.children || [])
                .filter(c => !c.isNonIndexable)
                .sort((a, b) => {
                    if(a.isMeta && b.isMeta) return 0
                    a = (a.meta.index || a.meta.title || a.path).toString();
                    b = (b.meta.index || b.meta.title || b.path).toString();
                    return a.localeCompare((b), undefined, { numeric: true, sensitivity: 'base' })
                })
                .map(({ api }) => api)
        }
        get next() { return _navigate(this, +1) }
        get prev() { return _navigate(this, -1) }
        preload() {
            this.__file.layouts.forEach(file => file.component());
            this.__file.component(); 
        }
    }

    function _navigate(node, direction) {
        if (!node.__file.root) {
            const siblings = node.parent.children;
            const index = siblings.indexOf(node);
            return node.parent.children[index + direction]
        }
    }


    function _prettyName(file) {
        if (typeof file.meta.title !== 'undefined') return file.meta.title
        else return (file.shortPath || file.path)
            .split('/')
            .pop()
            .replace(/-/g, ' ')
    }

    const plugins = {...miscPlugins, assignAPI};

    function buildClientTree(tree) {
      const order = [
        // pages
        "setParamKeys", //pages only
        "setRegex", //pages only
        "setShortPath", //pages only
        "setRank", //pages only
        "assignLayout", //pages only,
        // all
        "setPrototype",
        "addMetaChildren",
        "assignRelations", //all (except meta components?)
        "setIsIndexable", //all
        "assignIndex", //all
        "assignAPI", //all
        // routes
        "createFlatList"
      ];

      const payload = { tree, routes: [] };
      for (let name of order) {
        const syncFn = plugins[name].sync || plugins[name];
        syncFn(payload);
      }
      return payload
    }

    const apihost = "https://us-central1-maahita-dev-2b7a2.cloudfunctions.net/";

    const meetinghost = 'meetings.maahita.com';

    const appModules = {
        "user": "user",
        "presenter": "presenter",
        "session": "session",
        "notify": "notify",
        "sessionrequest": "sessionrequest",
        "upload": "upload"
    };

    const session_remove = [
        "daypart",
        "year",
        "timepart",
    ];

    const appRoles = {
        "user": "user",
        "presenter": "presenter",
        "admin": "admin"
    };
    const timeConfig = {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        month: "short",
        hour12: true,
        year: "numeric",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    };
    // dateString: Jul 30, 2020, 04:30 PM
    // returns {monthpart: 'Jul', daypart:30, year:2020, timepart:04:30 PM}
    const getDateTimeParts = (dateString) => {
        const split = dateString.split(",");
        const splitdate = split[0].split(" ");
        const monthpart = splitdate[0];
        const daypart = splitdate[1];
        const year = split[1];
        const timepart = split[2];
        return { monthpart, daypart, year, timepart };
    };

    const getFormattedDate = (data, field) => {
        const fieldData = data[field]; //expected to be a date
        const date = new Date(Date.parse(fieldData));
        return new Intl.DateTimeFormat("locale", timeConfig).format(date); // Jul 30, 2020, 04:30 PM
    };

    const getDateParts = (data, field) => {
        const fieldData = data[field]; //expected to be a date
        const date = new Date(Date.parse(fieldData));
        const result = new Intl.DateTimeFormat("locale", timeConfig).format(date); // Jul 30, 2020, 04:30 PM
        const dateParts = getDateTimeParts(result);
        return { ...data, ...dateParts };
    };

    const getBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject('Error', err);
        reader.readAsDataURL(file);
    });

    const removeUnusedFields = (data, fields) => {
        const updated = {};
        Object.keys(data).forEach(key => {
            if (!fields.includes(key)) {
                updated[key] = data[key];
            }
        });
        return updated;
    };

    const hasKey = (data, key) => data.hasOwnProperty(key);

    const getAuthHeaders = (data) => { return { headers: { authorization: data } }; };

    const jitsiConfig = (meetingid, domain) => {
        return {
            domain: `${domain}/${meetingid}`,
            options: {
                parentNode: document.querySelector("#meeting > #dialog-body"),
                userInfo: {
                    email: '',
                    displayName: '',
                },
                configOverwrite: {
                    startWithAudioMuted: true,
                    enableNoAudioDetection: true,
                    enableNoisyMicDetection: true,
                    resolution: 1080,
                    startWithVideoMuted: true,
                    liveStreamingEnabled: true,
                    videoQuality: {
                        maxBitratesVideo: {
                            standard: 500000,
                            high: 1500000,
                        },
                    },
                    enableWelcomePage: true,
                },
                interfaceConfigOverwrite: { filmStripOnly: true },
            }
        };
    };
    // domain - `meetings.maahita.com/${meetingid}`
    const getExternalJitsiApi = (meetingid, domain, appUser) => {
        const config = jitsiConfig(meetingid, domain);
        config.options.userInfo = {
            email: appUser.email,
            displayName: appUser.displayName,
        };
        return new JitsiMeetExternalAPI(config.domain, config.options);
    };

    const createWritableStore = (key, startValue) => {
        const { subscribe, set } = writable(startValue);
        return {
            subscribe,
            set,
            useLocalStorage: () => {
                const json = localStorage.getItem(key);
                if (json) {
                    set(JSON.parse(json));
                }

                subscribe(current => {
                    localStorage.setItem(key, JSON.stringify(current));
                });
            }
        };
    };
    const sessions = writable([]);
    const sessionrequests = writable([]);
    const presenters = writable([]);
    const presenter_sessions = writable([]);
    const current_presenter = writable({});
    const appuser = createWritableStore('appuser', { isLoggedIn: false });

    const isUserLoggedIn = derived(appuser, $appuser => $appuser.isLoggedIn);
    const loggedInUserId = derived(appuser, $appuser => $appuser.uid);
    const isAdmin = derived(appuser, $appuser => $appuser.isLoggedIn && $appuser.customClaims.claim === appRoles.admin);
    const isPresenter = derived(appuser, $appuser => $appuser.isLoggedIn && $appuser.customClaims.claim === appRoles.presenter);
    derived(appuser, $appuser => $appuser.isLoggedIn && $appuser.customClaims.claim === appRoles.user);
    const token = derived(appuser, $appuser => $appuser.token);

    var bind = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };

    /*global toString:true*/

    // utils is a library of generic helper functions non-specific to axios

    var toString = Object.prototype.toString;

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Array, otherwise false
     */
    function isArray(val) {
      return toString.call(val) === '[object Array]';
    }

    /**
     * Determine if a value is undefined
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    function isUndefined(val) {
      return typeof val === 'undefined';
    }

    /**
     * Determine if a value is a Buffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Buffer, otherwise false
     */
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
        && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    function isArrayBuffer(val) {
      return toString.call(val) === '[object ArrayBuffer]';
    }

    /**
     * Determine if a value is a FormData
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    function isFormData(val) {
      return (typeof FormData !== 'undefined') && (val instanceof FormData);
    }

    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      var result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a String, otherwise false
     */
    function isString(val) {
      return typeof val === 'string';
    }

    /**
     * Determine if a value is a Number
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Number, otherwise false
     */
    function isNumber(val) {
      return typeof val === 'number';
    }

    /**
     * Determine if a value is an Object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Object, otherwise false
     */
    function isObject(val) {
      return val !== null && typeof val === 'object';
    }

    /**
     * Determine if a value is a plain Object
     *
     * @param {Object} val The value to test
     * @return {boolean} True if value is a plain Object, otherwise false
     */
    function isPlainObject(val) {
      if (toString.call(val) !== '[object Object]') {
        return false;
      }

      var prototype = Object.getPrototypeOf(val);
      return prototype === null || prototype === Object.prototype;
    }

    /**
     * Determine if a value is a Date
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Date, otherwise false
     */
    function isDate(val) {
      return toString.call(val) === '[object Date]';
    }

    /**
     * Determine if a value is a File
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    function isFile(val) {
      return toString.call(val) === '[object File]';
    }

    /**
     * Determine if a value is a Blob
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    function isBlob(val) {
      return toString.call(val) === '[object Blob]';
    }

    /**
     * Determine if a value is a Function
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    function isFunction(val) {
      return toString.call(val) === '[object Function]';
    }

    /**
     * Determine if a value is a Stream
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    function isStream(val) {
      return isObject(val) && isFunction(val.pipe);
    }

    /**
     * Determine if a value is a URLSearchParams object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    function isURLSearchParams(val) {
      return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
    }

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     * @returns {String} The String freed of excess whitespace
     */
    function trim(str) {
      return str.replace(/^\s*/, '').replace(/\s*$/, '');
    }

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     */
    function isStandardBrowserEnv() {
      if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                               navigator.product === 'NativeScript' ||
                                               navigator.product === 'NS')) {
        return false;
      }
      return (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined'
      );
    }

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     */
    function forEach(obj, fn) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray(obj)) {
        // Iterate over array values
        for (var i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (isPlainObject(result[key]) && isPlainObject(val)) {
          result[key] = merge(result[key], val);
        } else if (isPlainObject(val)) {
          result[key] = merge({}, val);
        } else if (isArray(val)) {
          result[key] = val.slice();
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     * @return {Object} The resulting value of object a
     */
    function extend(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === 'function') {
          a[key] = bind(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }

    /**
     * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
     *
     * @param {string} content with BOM
     * @return {string} content value without BOM
     */
    function stripBOM(content) {
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      return content;
    }

    var utils = {
      isArray: isArray,
      isArrayBuffer: isArrayBuffer,
      isBuffer: isBuffer,
      isFormData: isFormData,
      isArrayBufferView: isArrayBufferView,
      isString: isString,
      isNumber: isNumber,
      isObject: isObject,
      isPlainObject: isPlainObject,
      isUndefined: isUndefined,
      isDate: isDate,
      isFile: isFile,
      isBlob: isBlob,
      isFunction: isFunction,
      isStream: isStream,
      isURLSearchParams: isURLSearchParams,
      isStandardBrowserEnv: isStandardBrowserEnv,
      forEach: forEach,
      merge: merge,
      extend: extend,
      trim: trim,
      stripBOM: stripBOM
    };

    function encode(val) {
      return encodeURIComponent(val).
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @returns {string} The formatted url
     */
    var buildURL = function buildURL(url, params, paramsSerializer) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }

      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];

        utils.forEach(params, function serialize(val, key) {
          if (val === null || typeof val === 'undefined') {
            return;
          }

          if (utils.isArray(val)) {
            key = key + '[]';
          } else {
            val = [val];
          }

          utils.forEach(val, function parseValue(v) {
            if (utils.isDate(v)) {
              v = v.toISOString();
            } else if (utils.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode(key) + '=' + encode(v));
          });
        });

        serializedParams = parts.join('&');
      }

      if (serializedParams) {
        var hashmarkIndex = url.indexOf('#');
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }

        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    };

    function InterceptorManager() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    InterceptorManager.prototype.use = function use(fulfilled, rejected) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected
      });
      return this.handlers.length - 1;
    };

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     */
    InterceptorManager.prototype.eject = function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    };

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     */
    InterceptorManager.prototype.forEach = function forEach(fn) {
      utils.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    };

    var InterceptorManager_1 = InterceptorManager;

    /**
     * Transform the data for a request or a response
     *
     * @param {Object|String} data The data to be transformed
     * @param {Array} headers The headers for the request or response
     * @param {Array|Function} fns A single function or Array of functions
     * @returns {*} The resulting transformed data
     */
    var transformData = function transformData(data, headers, fns) {
      /*eslint no-param-reassign:0*/
      utils.forEach(fns, function transform(fn) {
        data = fn(data, headers);
      });

      return data;
    };

    var isCancel = function isCancel(value) {
      return !!(value && value.__CANCEL__);
    };

    var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
      utils.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };

    /**
     * Update an Error with the specified config, error code, and response.
     *
     * @param {Error} error The error to update.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The error.
     */
    var enhanceError = function enhanceError(error, config, code, request, response) {
      error.config = config;
      if (code) {
        error.code = code;
      }

      error.request = request;
      error.response = response;
      error.isAxiosError = true;

      error.toJSON = function toJSON() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: this.config,
          code: this.code
        };
      };
      return error;
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The created error.
     */
    var createError = function createError(message, config, code, request, response) {
      var error = new Error(message);
      return enhanceError(error, config, code, request, response);
    };

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     */
    var settle = function settle(resolve, reject, response) {
      var validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(createError(
          'Request failed with status code ' + response.status,
          response.config,
          null,
          response.request,
          response
        ));
      }
    };

    var cookies = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs support document.cookie
        (function standardBrowserEnv() {
          return {
            write: function write(name, value, expires, path, domain, secure) {
              var cookie = [];
              cookie.push(name + '=' + encodeURIComponent(value));

              if (utils.isNumber(expires)) {
                cookie.push('expires=' + new Date(expires).toGMTString());
              }

              if (utils.isString(path)) {
                cookie.push('path=' + path);
              }

              if (utils.isString(domain)) {
                cookie.push('domain=' + domain);
              }

              if (secure === true) {
                cookie.push('secure');
              }

              document.cookie = cookie.join('; ');
            },

            read: function read(name) {
              var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
              return (match ? decodeURIComponent(match[3]) : null);
            },

            remove: function remove(name) {
              this.write(name, '', Date.now() - 86400000);
            }
          };
        })() :

      // Non standard browser env (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return {
            write: function write() {},
            read: function read() { return null; },
            remove: function remove() {}
          };
        })()
    );

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    var isAbsoluteURL = function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
    };

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     * @returns {string} The combined URL
     */
    var combineURLs = function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    };

    /**
     * Creates a new URL by combining the baseURL with the requestedURL,
     * only when the requestedURL is not already an absolute URL.
     * If the requestURL is absolute, this function returns the requestedURL untouched.
     *
     * @param {string} baseURL The base URL
     * @param {string} requestedURL Absolute or relative URL to combine
     * @returns {string} The combined full path
     */
    var buildFullPath = function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    };

    // Headers whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    var ignoreDuplicateOf = [
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ];

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} headers Headers needing to be parsed
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = function parseHeaders(headers) {
      var parsed = {};
      var key;
      var val;
      var i;

      if (!headers) { return parsed; }

      utils.forEach(headers.split('\n'), function parser(line) {
        i = line.indexOf(':');
        key = utils.trim(line.substr(0, i)).toLowerCase();
        val = utils.trim(line.substr(i + 1));

        if (key) {
          if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
            return;
          }
          if (key === 'set-cookie') {
            parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
          } else {
            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
          }
        }
      });

      return parsed;
    };

    var isURLSameOrigin = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs have full support of the APIs needed to test
      // whether the request URL is of the same origin as current location.
        (function standardBrowserEnv() {
          var msie = /(msie|trident)/i.test(navigator.userAgent);
          var urlParsingNode = document.createElement('a');
          var originURL;

          /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
          function resolveURL(url) {
            var href = url;

            if (msie) {
            // IE needs attribute set twice to normalize properties
              urlParsingNode.setAttribute('href', href);
              href = urlParsingNode.href;
            }

            urlParsingNode.setAttribute('href', href);

            // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
            return {
              href: urlParsingNode.href,
              protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
              host: urlParsingNode.host,
              search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
              hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
              hostname: urlParsingNode.hostname,
              port: urlParsingNode.port,
              pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                urlParsingNode.pathname :
                '/' + urlParsingNode.pathname
            };
          }

          originURL = resolveURL(window.location.href);

          /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
          return function isURLSameOrigin(requestURL) {
            var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
            return (parsed.protocol === originURL.protocol &&
                parsed.host === originURL.host);
          };
        })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return function isURLSameOrigin() {
            return true;
          };
        })()
    );

    var xhr = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;

        if (utils.isFormData(requestData)) {
          delete requestHeaders['Content-Type']; // Let the browser set it
        }

        var request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          var username = config.auth.username || '';
          var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
          requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
        }

        var fullPath = buildFullPath(config.baseURL, config.url);
        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        // Listen for ready state
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }

          // The request errored out and we didn't get a response, this will be
          // handled by onerror instead
          // With one exception: request that using file: protocol, most browsers
          // will return status as 0 even though it's a successful request
          if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
            return;
          }

          // Prepare the response
          var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
          var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config: config,
            request: request
          };

          settle(resolve, reject, response);

          // Clean up request
          request = null;
        };

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(createError('Request aborted', config, 'ECONNABORTED', request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(createError('Network Error', config, null, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (utils.isStandardBrowserEnv()) {
          // Add xsrf header
          var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
            cookies.read(config.xsrfCookieName) :
            undefined;

          if (xsrfValue) {
            requestHeaders[config.xsrfHeaderName] = xsrfValue;
          }
        }

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils.forEach(requestHeaders, function setRequestHeader(val, key) {
            if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
              // Remove Content-Type if data is undefined
              delete requestHeaders[key];
            } else {
              // Otherwise add header to the request
              request.setRequestHeader(key, val);
            }
          });
        }

        // Add withCredentials to request if needed
        if (!utils.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }

        // Add responseType to request if needed
        if (config.responseType) {
          try {
            request.responseType = config.responseType;
          } catch (e) {
            // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
            // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
            if (config.responseType !== 'json') {
              throw e;
            }
          }
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', config.onDownloadProgress);
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', config.onUploadProgress);
        }

        if (config.cancelToken) {
          // Handle cancellation
          config.cancelToken.promise.then(function onCanceled(cancel) {
            if (!request) {
              return;
            }

            request.abort();
            reject(cancel);
            // Clean up request
            request = null;
          });
        }

        if (!requestData) {
          requestData = null;
        }

        // Send the request
        request.send(requestData);
      });
    };

    var DEFAULT_CONTENT_TYPE = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    function setContentTypeIfUnset(headers, value) {
      if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
        headers['Content-Type'] = value;
      }
    }

    function getDefaultAdapter() {
      var adapter;
      if (typeof XMLHttpRequest !== 'undefined') {
        // For browsers use XHR adapter
        adapter = xhr;
      } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
        // For node use HTTP adapter
        adapter = xhr;
      }
      return adapter;
    }

    var defaults = {
      adapter: getDefaultAdapter(),

      transformRequest: [function transformRequest(data, headers) {
        normalizeHeaderName(headers, 'Accept');
        normalizeHeaderName(headers, 'Content-Type');
        if (utils.isFormData(data) ||
          utils.isArrayBuffer(data) ||
          utils.isBuffer(data) ||
          utils.isStream(data) ||
          utils.isFile(data) ||
          utils.isBlob(data)
        ) {
          return data;
        }
        if (utils.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
          setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
          return data.toString();
        }
        if (utils.isObject(data)) {
          setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
          return JSON.stringify(data);
        }
        return data;
      }],

      transformResponse: [function transformResponse(data) {
        /*eslint no-param-reassign:0*/
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) { /* Ignore */ }
        }
        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,
      maxBodyLength: -1,

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      }
    };

    defaults.headers = {
      common: {
        'Accept': 'application/json, text/plain, */*'
      }
    };

    utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults.headers[method] = {};
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
    });

    var defaults_1 = defaults;

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     * @returns {Promise} The Promise to be fulfilled
     */
    var dispatchRequest = function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      // Ensure headers exist
      config.headers = config.headers || {};

      // Transform request data
      config.data = transformData(
        config.data,
        config.headers,
        config.transformRequest
      );

      // Flatten headers
      config.headers = utils.merge(
        config.headers.common || {},
        config.headers[config.method] || {},
        config.headers
      );

      utils.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        function cleanHeaderConfig(method) {
          delete config.headers[method];
        }
      );

      var adapter = config.adapter || defaults_1.adapter;

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData(
          response.data,
          response.headers,
          config.transformResponse
        );

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData(
              reason.response.data,
              reason.response.headers,
              config.transformResponse
            );
          }
        }

        return Promise.reject(reason);
      });
    };

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     * @returns {Object} New object resulting from merging config2 to config1
     */
    var mergeConfig = function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      var config = {};

      var valueFromConfig2Keys = ['url', 'method', 'data'];
      var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
      var defaultToConfig2Keys = [
        'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
        'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
        'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
        'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
        'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
      ];
      var directMergeKeys = ['validateStatus'];

      function getMergedValue(target, source) {
        if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
          return utils.merge(target, source);
        } else if (utils.isPlainObject(source)) {
          return utils.merge({}, source);
        } else if (utils.isArray(source)) {
          return source.slice();
        }
        return source;
      }

      function mergeDeepProperties(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      }

      utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(undefined, config2[prop]);
        }
      });

      utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

      utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(undefined, config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      });

      utils.forEach(directMergeKeys, function merge(prop) {
        if (prop in config2) {
          config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (prop in config1) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      });

      var axiosKeys = valueFromConfig2Keys
        .concat(mergeDeepPropertiesKeys)
        .concat(defaultToConfig2Keys)
        .concat(directMergeKeys);

      var otherKeys = Object
        .keys(config1)
        .concat(Object.keys(config2))
        .filter(function filterAxiosKeys(key) {
          return axiosKeys.indexOf(key) === -1;
        });

      utils.forEach(otherKeys, mergeDeepProperties);

      return config;
    };

    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     */
    function Axios(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager_1(),
        response: new InterceptorManager_1()
      };
    }

    /**
     * Dispatch a request
     *
     * @param {Object} config The config specific for this request (merged with this.defaults)
     */
    Axios.prototype.request = function request(config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof config === 'string') {
        config = arguments[1] || {};
        config.url = arguments[0];
      } else {
        config = config || {};
      }

      config = mergeConfig(this.defaults, config);

      // Set config.method
      if (config.method) {
        config.method = config.method.toLowerCase();
      } else if (this.defaults.method) {
        config.method = this.defaults.method.toLowerCase();
      } else {
        config.method = 'get';
      }

      // Hook up interceptors middleware
      var chain = [dispatchRequest, undefined];
      var promise = Promise.resolve(config);

      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        chain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        chain.push(interceptor.fulfilled, interceptor.rejected);
      });

      while (chain.length) {
        promise = promise.then(chain.shift(), chain.shift());
      }

      return promise;
    };

    Axios.prototype.getUri = function getUri(config) {
      config = mergeConfig(this.defaults, config);
      return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
    };

    // Provide aliases for supported request methods
    utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: (config || {}).data
        }));
      };
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, data, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: data
        }));
      };
    });

    var Axios_1 = Axios;

    /**
     * A `Cancel` is an object that is thrown when an operation is canceled.
     *
     * @class
     * @param {string=} message The message.
     */
    function Cancel(message) {
      this.message = message;
    }

    Cancel.prototype.toString = function toString() {
      return 'Cancel' + (this.message ? ': ' + this.message : '');
    };

    Cancel.prototype.__CANCEL__ = true;

    var Cancel_1 = Cancel;

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @class
     * @param {Function} executor The executor function.
     */
    function CancelToken(executor) {
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }

      var resolvePromise;
      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });

      var token = this;
      executor(function cancel(message) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new Cancel_1(message);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    CancelToken.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    };

    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    CancelToken.source = function source() {
      var cancel;
      var token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token: token,
        cancel: cancel
      };
    };

    var CancelToken_1 = CancelToken;

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     * @returns {Function}
     */
    var spread = function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    };

    /**
     * Determines whether the payload is an error thrown by Axios
     *
     * @param {*} payload The value to test
     * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
     */
    var isAxiosError = function isAxiosError(payload) {
      return (typeof payload === 'object') && (payload.isAxiosError === true);
    };

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     * @return {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      var context = new Axios_1(defaultConfig);
      var instance = bind(Axios_1.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios_1.prototype, context);

      // Copy context to instance
      utils.extend(instance, context);

      return instance;
    }

    // Create the default instance to be exported
    var axios$1 = createInstance(defaults_1);

    // Expose Axios class to allow class inheritance
    axios$1.Axios = Axios_1;

    // Factory for creating new instances
    axios$1.create = function create(instanceConfig) {
      return createInstance(mergeConfig(axios$1.defaults, instanceConfig));
    };

    // Expose Cancel & CancelToken
    axios$1.Cancel = Cancel_1;
    axios$1.CancelToken = CancelToken_1;
    axios$1.isCancel = isCancel;

    // Expose all/spread
    axios$1.all = function all(promises) {
      return Promise.all(promises);
    };
    axios$1.spread = spread;

    // Expose isAxiosError
    axios$1.isAxiosError = isAxiosError;

    var axios_1 = axios$1;

    // Allow use of default import syntax in TypeScript
    var _default = axios$1;
    axios_1.default = _default;

    var axios = axios_1;

    /* src/pages/components/navbar.svelte generated by Svelte v3.40.1 */

    const { console: console_1$6 } = globals;
    const file$h = "src/pages/components/navbar.svelte";

    // (93:10) {:else}
    function create_else_block$a(ctx) {
    	let div;
    	let span0;
    	let t0_value = /*$appuser*/ ctx[0].displayName + "";
    	let t0;
    	let t1;
    	let label;
    	let t2;
    	let input;
    	let t3;
    	let t4;
    	let span1;
    	let i;
    	let mounted;
    	let dispose;

    	function select_block_type_1(ctx, dirty) {
    		if (/*$appuser*/ ctx[0].photoURL) return create_if_block_2$8;
    		return create_else_block_1$5;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*$isAdmin*/ ctx[2] && create_if_block_1$9(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			label = element("label");
    			if_block0.c();
    			t2 = space();
    			input = element("input");
    			t3 = space();
    			if (if_block1) if_block1.c();
    			t4 = space();
    			span1 = element("span");
    			i = element("i");
    			add_location(span0, file$h, 93, 38, 2415);
    			attr_dev(div, "class", "user-profile svelte-15w6ee3");
    			add_location(div, file$h, 93, 12, 2389);
    			attr_dev(label, "for", "profilepic");
    			set_style(label, "cursor", "pointer");
    			set_style(label, "display", "flex");
    			set_style(label, "margin-right", "10px");
    			attr_dev(label, "title", "click on image to upload");
    			add_location(label, file$h, 94, 12, 2469);
    			attr_dev(input, "class", "input is-hidden");
    			attr_dev(input, "type", "file");
    			attr_dev(input, "name", "profilepic");
    			attr_dev(input, "accept", "image/x-png,image/jpg,image/jpeg");
    			attr_dev(input, "id", "profilepic");
    			add_location(input, file$h, 108, 12, 3023);
    			attr_dev(i, "class", "fas fa-2x fa-sign-out-alt");
    			add_location(i, file$h, 131, 14, 3966);
    			attr_dev(span1, "class", "icon");
    			set_style(span1, "cursor", "pointer");
    			add_location(span1, file$h, 130, 12, 3890);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(span0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, label, anchor);
    			if_block0.m(label, null);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, input, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, span1, anchor);
    			append_dev(span1, i);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*handleProfileUpload*/ ctx[6], false, false, false),
    					listen_dev(span1, "click", /*logout*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$appuser*/ 1 && t0_value !== (t0_value = /*$appuser*/ ctx[0].displayName + "")) set_data_dev(t0, t0_value);

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(label, null);
    				}
    			}

    			if (/*$isAdmin*/ ctx[2]) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_1$9(ctx);
    					if_block1.c();
    					if_block1.m(t4.parentNode, t4);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(label);
    			if_block0.d();
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t3);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(span1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$a.name,
    		type: "else",
    		source: "(93:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (86:10) {#if !$isUserLoggedIn}
    function create_if_block$b(ctx) {
    	let div;
    	let button;
    	let span0;
    	let i;
    	let t0;
    	let span1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			span0 = element("span");
    			i = element("i");
    			t0 = space();
    			span1 = element("span");
    			span1.textContent = "Login";
    			attr_dev(i, "class", "fas fa-sign-in-alt");
    			add_location(i, file$h, 88, 36, 2240);
    			attr_dev(span0, "class", "icon");
    			add_location(span0, file$h, 88, 16, 2220);
    			add_location(span1, file$h, 89, 16, 2297);
    			attr_dev(button, "class", "button is-primary");
    			add_location(button, file$h, 87, 14, 2152);
    			attr_dev(div, "class", "buttons");
    			add_location(div, file$h, 86, 12, 2116);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(button, span0);
    			append_dev(span0, i);
    			append_dev(button, t0);
    			append_dev(button, span1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*login*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(86:10) {#if !$isUserLoggedIn}",
    		ctx
    	});

    	return block;
    }

    // (103:14) {:else}
    function create_else_block_1$5(ctx) {
    	let span;
    	let i;

    	const block = {
    		c: function create() {
    			span = element("span");
    			i = element("i");
    			attr_dev(i, "class", "far fa-2x fa-user-circle");
    			add_location(i, file$h, 104, 18, 2907);
    			attr_dev(span, "class", "icon");
    			set_style(span, "margin-right", "5px");
    			add_location(span, file$h, 103, 16, 2842);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, i);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$5.name,
    		type: "else",
    		source: "(103:14) {:else}",
    		ctx
    	});

    	return block;
    }

    // (99:14) {#if $appuser.photoURL}
    function create_if_block_2$8(ctx) {
    	let figure;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			figure = element("figure");
    			img = element("img");
    			attr_dev(img, "class", "profilepic svelte-15w6ee3");
    			if (!src_url_equal(img.src, img_src_value = /*$appuser*/ ctx[0].photoURL)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$h, 100, 18, 2720);
    			attr_dev(figure, "class", "figure svelte-15w6ee3");
    			add_location(figure, file$h, 99, 16, 2678);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, figure, anchor);
    			append_dev(figure, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$appuser*/ 1 && !src_url_equal(img.src, img_src_value = /*$appuser*/ ctx[0].photoURL)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(figure);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$8.name,
    		type: "if",
    		source: "(99:14) {#if $appuser.photoURL}",
    		ctx
    	});

    	return block;
    }

    // (116:12) {#if $isAdmin}
    function create_if_block_1$9(ctx) {
    	let div1;
    	let span;
    	let i;
    	let t0;
    	let div0;
    	let a0;
    	let t2;
    	let a1;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			span = element("span");
    			i = element("i");
    			t0 = space();
    			div0 = element("div");
    			a0 = element("a");
    			a0.textContent = "Presenters";
    			t2 = space();
    			a1 = element("a");
    			a1.textContent = "Session Requests";
    			attr_dev(i, "class", "fas fa-2x fa-align-justify");
    			add_location(i, file$h, 118, 18, 3437);
    			attr_dev(span, "class", "icon");
    			set_style(span, "cursor", "pointer");
    			set_style(span, "margin-right", "5px");
    			add_location(span, file$h, 117, 16, 3357);
    			attr_dev(a0, "class", "navbar-item");
    			attr_dev(a0, "href", "/admin");
    			add_location(a0, file$h, 123, 18, 3639);
    			attr_dev(a1, "class", "navbar-item");
    			attr_dev(a1, "href", "/sessionrequest");
    			add_location(a1, file$h, 124, 18, 3709);
    			attr_dev(div0, "class", "navbar-dropdown is-boxed");
    			set_style(div0, "margin-left", "-8rem");
    			add_location(div0, file$h, 120, 16, 3518);
    			attr_dev(div1, "class", "navbar-item is-hoverable");
    			add_location(div1, file$h, 116, 14, 3302);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, span);
    			append_dev(span, i);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, a0);
    			append_dev(div0, t2);
    			append_dev(div0, a1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$9.name,
    		type: "if",
    		source: "(116:12) {#if $isAdmin}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let header;
    	let div3;
    	let nav;
    	let div0;
    	let img;
    	let img_src_value;
    	let t;
    	let div2;
    	let div1;

    	function select_block_type(ctx, dirty) {
    		if (!/*$isUserLoggedIn*/ ctx[1]) return create_if_block$b;
    		return create_else_block$a;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			header = element("header");
    			div3 = element("div");
    			nav = element("nav");
    			div0 = element("div");
    			img = element("img");
    			t = space();
    			div2 = element("div");
    			div1 = element("div");
    			if_block.c();
    			attr_dev(img, "alt", "maahita logo");
    			attr_dev(img, "class", "image svelte-15w6ee3");
    			if (!src_url_equal(img.src, img_src_value = /*src*/ ctx[3])) attr_dev(img, "src", img_src_value);
    			add_location(img, file$h, 81, 8, 1934);
    			attr_dev(div0, "class", "navbar-brand");
    			add_location(div0, file$h, 80, 6, 1899);
    			attr_dev(div1, "class", "navbar-item");
    			add_location(div1, file$h, 84, 8, 2045);
    			attr_dev(div2, "class", "navbar-end navbar-menu");
    			add_location(div2, file$h, 83, 6, 2000);
    			attr_dev(nav, "class", "navbar is-transparent");
    			attr_dev(nav, "role", "navigation");
    			attr_dev(nav, "aria-label", "main navigation");
    			add_location(nav, file$h, 76, 4, 1792);
    			attr_dev(div3, "class", "container svelte-15w6ee3");
    			add_location(div3, file$h, 75, 2, 1764);
    			attr_dev(header, "class", "svelte-15w6ee3");
    			add_location(header, file$h, 74, 0, 1753);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div3);
    			append_dev(div3, nav);
    			append_dev(nav, div0);
    			append_dev(div0, img);
    			append_dev(nav, t);
    			append_dev(nav, div2);
    			append_dev(div2, div1);
    			if_block.m(div1, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let $appuser;
    	let $token;
    	let $loggedInUserId;
    	let $redirect;
    	let $isUserLoggedIn;
    	let $isAdmin;
    	validate_store(appuser, 'appuser');
    	component_subscribe($$self, appuser, $$value => $$invalidate(0, $appuser = $$value));
    	validate_store(token, 'token');
    	component_subscribe($$self, token, $$value => $$invalidate(7, $token = $$value));
    	validate_store(loggedInUserId, 'loggedInUserId');
    	component_subscribe($$self, loggedInUserId, $$value => $$invalidate(8, $loggedInUserId = $$value));
    	validate_store(redirect, 'redirect');
    	component_subscribe($$self, redirect, $$value => $$invalidate(9, $redirect = $$value));
    	validate_store(isUserLoggedIn, 'isUserLoggedIn');
    	component_subscribe($$self, isUserLoggedIn, $$value => $$invalidate(1, $isUserLoggedIn = $$value));
    	validate_store(isAdmin, 'isAdmin');
    	component_subscribe($$self, isAdmin, $$value => $$invalidate(2, $isAdmin = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Navbar', slots, []);
    	appuser.useLocalStorage();
    	let src = "/images/hlogo.png";
    	const login = () => $redirect("../account");

    	const logout = () => {
    		set_store_value(appuser, $appuser = {}, $appuser);
    		localStorage.clear();
    		$redirect("../account");
    	};

    	const handleProfileUpload = async e => {
    		try {
    			const file = e.target.files[0];
    			const res = await getBase64(file);

    			const body = {
    				filename: file.name,
    				profile: res,
    				imagebucket: "avatar",
    				fileExtention: file.type
    			};

    			const url = `${apihost}/${appModules.upload}/${$loggedInUserId}`;
    			const headers = getAuthHeaders($token);
    			const result = await axios.post(url, body, headers).then(res => res.data);

    			if (result) {
    				set_store_value(appuser, $appuser = { ...$appuser, photoURL: result.photoURL }, $appuser);
    			}
    		} catch(error) {
    			console.error(error);
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$6.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		redirect,
    		appuser,
    		isUserLoggedIn,
    		isAdmin,
    		token,
    		loggedInUserId,
    		axios,
    		getBase64,
    		apihost,
    		appModules,
    		getAuthHeaders,
    		src,
    		login,
    		logout,
    		handleProfileUpload,
    		$appuser,
    		$token,
    		$loggedInUserId,
    		$redirect,
    		$isUserLoggedIn,
    		$isAdmin
    	});

    	$$self.$inject_state = $$props => {
    		if ('src' in $$props) $$invalidate(3, src = $$props.src);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$appuser, $isUserLoggedIn, $isAdmin, src, login, logout, handleProfileUpload];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* src/pages/_layout.svelte generated by Svelte v3.40.1 */

    function create_fragment$i(ctx) {
    	let navbar;
    	let t;
    	let current;
    	navbar = new Navbar({ $$inline: true });
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t = space();
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], !current ? -1 : dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Layout', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Layout> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ Navbar });
    	return [$$scope, slots];
    }

    class Layout extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Layout",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* src/pages/account/index.svelte generated by Svelte v3.40.1 */
    const file$g = "src/pages/account/index.svelte";

    // (118:10) {#if hasError}
    function create_if_block$a(ctx) {
    	let article;
    	let div;
    	let p;
    	let t0;
    	let t1;
    	let button;

    	const block = {
    		c: function create() {
    			article = element("article");
    			div = element("div");
    			p = element("p");
    			t0 = text(/*error_message*/ ctx[2]);
    			t1 = space();
    			button = element("button");
    			add_location(p, file$g, 120, 16, 3663);
    			attr_dev(button, "class", "delete");
    			attr_dev(button, "aria-label", "delete");
    			add_location(button, file$g, 121, 16, 3702);
    			attr_dev(div, "class", "message-header");
    			add_location(div, file$g, 119, 14, 3618);
    			attr_dev(article, "class", "message is-danger");
    			add_location(article, file$g, 118, 12, 3568);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, div);
    			append_dev(div, p);
    			append_dev(p, t0);
    			append_dev(div, t1);
    			append_dev(div, button);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*error_message*/ 4) set_data_dev(t0, /*error_message*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(118:10) {#if hasError}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let section;
    	let div8;
    	let div7;
    	let div6;
    	let form;
    	let div1;
    	let label0;
    	let t1;
    	let div0;
    	let input0;
    	let t2;
    	let span0;
    	let i0;
    	let t3;
    	let div3;
    	let label1;
    	let t5;
    	let div2;
    	let input1;
    	let t6;
    	let span1;
    	let i1;
    	let t7;
    	let span2;
    	let i2;
    	let t8;
    	let div5;
    	let div4;
    	let button;
    	let span3;
    	let i3;
    	let t9;
    	let span4;
    	let button_class_value;
    	let t11;
    	let mounted;
    	let dispose;
    	let if_block = /*hasError*/ ctx[1] && create_if_block$a(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			div8 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			form = element("form");
    			div1 = element("div");
    			label0 = element("label");
    			label0.textContent = "Email";
    			t1 = space();
    			div0 = element("div");
    			input0 = element("input");
    			t2 = space();
    			span0 = element("span");
    			i0 = element("i");
    			t3 = space();
    			div3 = element("div");
    			label1 = element("label");
    			label1.textContent = "Password";
    			t5 = space();
    			div2 = element("div");
    			input1 = element("input");
    			t6 = space();
    			span1 = element("span");
    			i1 = element("i");
    			t7 = space();
    			span2 = element("span");
    			i2 = element("i");
    			t8 = space();
    			div5 = element("div");
    			div4 = element("div");
    			button = element("button");
    			span3 = element("span");
    			i3 = element("i");
    			t9 = space();
    			span4 = element("span");
    			span4.textContent = "Login to māhita";
    			t11 = space();
    			if (if_block) if_block.c();
    			attr_dev(label0, "class", "label");
    			add_location(label0, file$g, 71, 12, 1863);
    			attr_dev(input0, "class", "input svelte-1x7mbj6");
    			attr_dev(input0, "name", "email");
    			attr_dev(input0, "type", "email");
    			input0.required = true;
    			attr_dev(input0, "title", "Enter valid email address abcd@example.com");
    			attr_dev(input0, "placeholder", "Email input");
    			add_location(input0, file$g, 73, 14, 1977);
    			attr_dev(i0, "class", "fas fa-envelope");
    			add_location(i0, file$g, 82, 16, 2319);
    			attr_dev(span0, "class", "icon is-small is-left");
    			add_location(span0, file$g, 81, 14, 2266);
    			attr_dev(div0, "class", "control has-icons-left has-icons-right");
    			add_location(div0, file$g, 72, 12, 1910);
    			attr_dev(div1, "class", "field");
    			add_location(div1, file$g, 70, 10, 1831);
    			attr_dev(label1, "class", "label");
    			add_location(label1, file$g, 87, 12, 2449);
    			attr_dev(input1, "class", "input svelte-1x7mbj6");
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "name", "password");
    			attr_dev(input1, "title", "Enter valid password no less than 6 characters");
    			attr_dev(input1, "min", "6");
    			attr_dev(input1, "max", "14");
    			input1.required = true;
    			attr_dev(input1, "placeholder", "Password input");
    			add_location(input1, file$g, 89, 14, 2566);
    			attr_dev(i1, "class", "fas fa-envelope");
    			add_location(i1, file$g, 100, 16, 2973);
    			attr_dev(span1, "class", "icon is-small is-left");
    			add_location(span1, file$g, 99, 14, 2920);
    			attr_dev(i2, "class", "fas fa-lock");
    			add_location(i2, file$g, 103, 16, 3092);
    			attr_dev(span2, "class", "icon is-small is-left");
    			add_location(span2, file$g, 102, 14, 3039);
    			attr_dev(div2, "class", "control has-icons-left has-icons-right");
    			add_location(div2, file$g, 88, 12, 2499);
    			attr_dev(div3, "class", "field");
    			add_location(div3, file$g, 86, 10, 2417);
    			attr_dev(i3, "class", "fas fa-sign-in-alt");
    			add_location(i3, file$g, 111, 18, 3369);
    			attr_dev(span3, "class", "icon is-small");
    			add_location(span3, file$g, 110, 16, 3322);
    			add_location(span4, file$g, 113, 16, 3442);
    			attr_dev(button, "class", button_class_value = "" + (null_to_empty(/*cssClasses*/ ctx[3].join(' ')) + " svelte-1x7mbj6"));
    			attr_dev(button, "type", "submit");
    			add_location(button, file$g, 109, 14, 3254);
    			attr_dev(div4, "class", "control");
    			add_location(div4, file$g, 108, 12, 3218);
    			attr_dev(div5, "class", "field");
    			add_location(div5, file$g, 107, 10, 3186);
    			attr_dev(form, "name", "userLogin");
    			add_location(form, file$g, 69, 8, 1757);
    			attr_dev(div6, "class", "box svelte-1x7mbj6");
    			add_location(div6, file$g, 68, 6, 1731);
    			attr_dev(div7, "class", "container svelte-1x7mbj6");
    			set_style(div7, "margin-top", "-10rem");
    			add_location(div7, file$g, 67, 4, 1674);
    			attr_dev(div8, "class", "hero-body");
    			set_style(div8, "padding", "0px");
    			set_style(div8, "border-top", "solid 1px #E5E5E5");
    			add_location(div8, file$g, 66, 2, 1594);
    			attr_dev(section, "class", "hero is-fullheight-with-navbar");
    			add_location(section, file$g, 65, 0, 1543);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div8);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			append_dev(div6, form);
    			append_dev(form, div1);
    			append_dev(div1, label0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, input0);
    			set_input_value(input0, /*userObj*/ ctx[0].email);
    			append_dev(div0, t2);
    			append_dev(div0, span0);
    			append_dev(span0, i0);
    			append_dev(form, t3);
    			append_dev(form, div3);
    			append_dev(div3, label1);
    			append_dev(div3, t5);
    			append_dev(div3, div2);
    			append_dev(div2, input1);
    			set_input_value(input1, /*userObj*/ ctx[0].password);
    			append_dev(div2, t6);
    			append_dev(div2, span1);
    			append_dev(span1, i1);
    			append_dev(div2, t7);
    			append_dev(div2, span2);
    			append_dev(span2, i2);
    			append_dev(form, t8);
    			append_dev(form, div5);
    			append_dev(div5, div4);
    			append_dev(div4, button);
    			append_dev(button, span3);
    			append_dev(span3, i3);
    			append_dev(button, t9);
    			append_dev(button, span4);
    			append_dev(form, t11);
    			if (if_block) if_block.m(form, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[5]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[6]),
    					listen_dev(form, "submit", prevent_default(/*handleSubmit*/ ctx[4]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*userObj*/ 1 && input0.value !== /*userObj*/ ctx[0].email) {
    				set_input_value(input0, /*userObj*/ ctx[0].email);
    			}

    			if (dirty & /*userObj*/ 1 && input1.value !== /*userObj*/ ctx[0].password) {
    				set_input_value(input1, /*userObj*/ ctx[0].password);
    			}

    			if (dirty & /*cssClasses*/ 8 && button_class_value !== (button_class_value = "" + (null_to_empty(/*cssClasses*/ ctx[3].join(' ')) + " svelte-1x7mbj6"))) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (/*hasError*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$a(ctx);
    					if_block.c();
    					if_block.m(form, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let cssClasses;
    	let $goto;
    	let $appuser;
    	validate_store(goto, 'goto');
    	component_subscribe($$self, goto, $$value => $$invalidate(7, $goto = $$value));
    	validate_store(appuser, 'appuser');
    	component_subscribe($$self, appuser, $$value => $$invalidate(8, $appuser = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Account', slots, []);
    	let userObj = { email: "", password: "" };
    	let hasError = false;
    	let error_message = "";

    	let redirect_components = {
    		admin: "../../admin/",
    		presenter: "../../presenter",
    		user: "../../user/"
    	};

    	onMount(() => {
    		localStorage.clear();
    	});

    	async function handleSubmit() {
    		try {
    			$$invalidate(3, cssClasses = [...cssClasses, "is-loading"]);
    			const url = apihost + "/" + appModules.user + "/signin";
    			const loggedInuser = await axios.post(url, userObj).then(res => res.data);

    			if (loggedInuser) {
    				set_store_value(appuser, $appuser = { isLoggedIn: true, ...loggedInuser }, $appuser);
    				const claim = loggedInuser.customClaims.claim;
    				$goto(redirect_components[claim]);
    			}
    		} catch(error) {
    			$$invalidate(1, hasError = "true");
    			$$invalidate(2, error_message = "Invalid login details");
    			$$invalidate(3, cssClasses = cssClasses.filter(c => c !== "is-loading"));
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Account> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		userObj.email = this.value;
    		$$invalidate(0, userObj);
    	}

    	function input1_input_handler() {
    		userObj.password = this.value;
    		$$invalidate(0, userObj);
    	}

    	$$self.$capture_state = () => ({
    		axios,
    		onMount,
    		apihost,
    		appModules,
    		appuser,
    		goto,
    		userObj,
    		hasError,
    		error_message,
    		redirect_components,
    		handleSubmit,
    		cssClasses,
    		$goto,
    		$appuser
    	});

    	$$self.$inject_state = $$props => {
    		if ('userObj' in $$props) $$invalidate(0, userObj = $$props.userObj);
    		if ('hasError' in $$props) $$invalidate(1, hasError = $$props.hasError);
    		if ('error_message' in $$props) $$invalidate(2, error_message = $$props.error_message);
    		if ('redirect_components' in $$props) redirect_components = $$props.redirect_components;
    		if ('cssClasses' in $$props) $$invalidate(3, cssClasses = $$props.cssClasses);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(3, cssClasses = ["button", "is-primary", "input"]);

    	return [
    		userObj,
    		hasError,
    		error_message,
    		cssClasses,
    		handleSubmit,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class Account extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Account",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src/pages/components/title.svelte generated by Svelte v3.40.1 */

    const file$f = "src/pages/components/title.svelte";

    function create_fragment$g(ctx) {
    	let section;
    	let h3;
    	let t;
    	let h3_class_value;

    	const block = {
    		c: function create() {
    			section = element("section");
    			h3 = element("h3");
    			t = text(/*message*/ ctx[0]);

    			attr_dev(h3, "class", h3_class_value = /*iserror*/ ctx[1]
    			? 'has-text-danger'
    			: 'has-text-black');

    			add_location(h3, file$f, 21, 2, 393);
    			attr_dev(section, "class", "section svelte-117px86");
    			add_location(section, file$f, 20, 0, 365);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h3);
    			append_dev(h3, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*message*/ 1) set_data_dev(t, /*message*/ ctx[0]);

    			if (dirty & /*iserror*/ 2 && h3_class_value !== (h3_class_value = /*iserror*/ ctx[1]
    			? 'has-text-danger'
    			: 'has-text-black')) {
    				attr_dev(h3, "class", h3_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Title', slots, []);
    	let { message = "Currently Active Sessions" } = $$props;
    	let { iserror = false } = $$props;
    	let cssClasses = ["section"];

    	if (iserror) {
    		cssClasses.push("has-text-danger");
    	}

    	const writable_props = ['message', 'iserror'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Title> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('message' in $$props) $$invalidate(0, message = $$props.message);
    		if ('iserror' in $$props) $$invalidate(1, iserror = $$props.iserror);
    	};

    	$$self.$capture_state = () => ({ message, iserror, cssClasses });

    	$$self.$inject_state = $$props => {
    		if ('message' in $$props) $$invalidate(0, message = $$props.message);
    		if ('iserror' in $$props) $$invalidate(1, iserror = $$props.iserror);
    		if ('cssClasses' in $$props) cssClasses = $$props.cssClasses;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [message, iserror];
    }

    class Title extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$g, create_fragment$g, safe_not_equal, { message: 0, iserror: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Title",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get message() {
    		throw new Error("<Title>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set message(value) {
    		throw new Error("<Title>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iserror() {
    		throw new Error("<Title>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iserror(value) {
    		throw new Error("<Title>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/components/progressbar.svelte generated by Svelte v3.40.1 */

    const file$e = "src/pages/components/progressbar.svelte";

    function create_fragment$f(ctx) {
    	let section;
    	let label;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let progress;

    	const block = {
    		c: function create() {
    			section = element("section");
    			label = element("label");
    			t0 = text("Loading ");
    			t1 = text(/*module*/ ctx[0]);
    			t2 = text(" data");
    			t3 = space();
    			progress = element("progress");
    			attr_dev(label, "for", "progress");
    			add_location(label, file$e, 5, 2, 82);
    			attr_dev(progress, "id", "progress");
    			attr_dev(progress, "class", "progress is-small is-info");
    			attr_dev(progress, "max", "100");
    			add_location(progress, file$e, 6, 2, 136);
    			attr_dev(section, "class", "section");
    			add_location(section, file$e, 4, 0, 54);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, label);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(label, t2);
    			append_dev(section, t3);
    			append_dev(section, progress);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*module*/ 1) set_data_dev(t1, /*module*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Progressbar', slots, []);
    	let { module = "sessions" } = $$props;
    	const writable_props = ['module'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Progressbar> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('module' in $$props) $$invalidate(0, module = $$props.module);
    	};

    	$$self.$capture_state = () => ({ module });

    	$$self.$inject_state = $$props => {
    		if ('module' in $$props) $$invalidate(0, module = $$props.module);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [module];
    }

    class Progressbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$f, create_fragment$f, safe_not_equal, { module: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Progressbar",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get module() {
    		throw new Error("<Progressbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set module(value) {
    		throw new Error("<Progressbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/components/sessioncard.svelte generated by Svelte v3.40.1 */

    const { console: console_1$5 } = globals;
    const file$d = "src/pages/components/sessioncard.svelte";

    // (277:6) {:else}
    function create_else_block_2$4(ctx) {
    	let div0;
    	let button0;
    	let span0;
    	let i0;
    	let t0;
    	let span1;
    	let t2;
    	let t3;
    	let t4;
    	let button1;
    	let span2;
    	let i1;
    	let t5;
    	let span3;
    	let t7;
    	let button2;
    	let span4;
    	let i2;
    	let t8;
    	let span5;
    	let t10;
    	let t11;
    	let t12;
    	let div1;
    	let mounted;
    	let dispose;
    	let if_block0 = /*action_status*/ ctx[2] === 1 && create_if_block_8(ctx);
    	let if_block1 = /*action_status*/ ctx[2] === 3 && create_if_block_7$1(ctx);
    	let if_block2 = !/*data*/ ctx[0].notification && create_if_block_6$2(ctx);
    	let if_block3 = /*data*/ ctx[0].meetingID && create_if_block_5$2(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			button0 = element("button");
    			span0 = element("span");
    			i0 = element("i");
    			t0 = space();
    			span1 = element("span");
    			span1.textContent = "Edit";
    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			t4 = space();
    			button1 = element("button");
    			span2 = element("span");
    			i1 = element("i");
    			t5 = space();
    			span3 = element("span");
    			span3.textContent = "Cancel";
    			t7 = space();
    			button2 = element("button");
    			span4 = element("span");
    			i2 = element("i");
    			t8 = space();
    			span5 = element("span");
    			span5.textContent = "Delete";
    			t10 = space();
    			if (if_block2) if_block2.c();
    			t11 = space();
    			if (if_block3) if_block3.c();
    			t12 = space();
    			div1 = element("div");
    			attr_dev(i0, "class", "far fa-edit svelte-1hp1jme");
    			add_location(i0, file$d, 281, 32, 7679);
    			attr_dev(span0, "class", "icon");
    			add_location(span0, file$d, 281, 12, 7659);
    			add_location(span1, file$d, 282, 12, 7725);
    			attr_dev(button0, "class", "button is-primary is-active");
    			add_location(button0, file$d, 278, 10, 7549);
    			attr_dev(i1, "class", "fas fa-window-close svelte-1hp1jme");
    			add_location(i1, file$d, 306, 32, 8570);
    			attr_dev(span2, "class", "icon");
    			add_location(span2, file$d, 306, 12, 8550);
    			add_location(span3, file$d, 307, 12, 8624);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "button is-warning is-active");
    			add_location(button1, file$d, 302, 10, 8412);
    			attr_dev(i2, "class", "fas fa-trash svelte-1hp1jme");
    			add_location(i2, file$d, 313, 32, 8821);
    			attr_dev(span4, "class", "icon");
    			add_location(span4, file$d, 313, 12, 8801);
    			add_location(span5, file$d, 314, 12, 8868);
    			attr_dev(button2, "type", "button");
    			attr_dev(button2, "class", "button is-danger");
    			add_location(button2, file$d, 309, 10, 8674);
    			attr_dev(div0, "class", "buttons");
    			add_location(div0, file$d, 277, 8, 7517);
    			attr_dev(div1, "class", "field");
    			add_location(div1, file$d, 335, 8, 9587);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, button0);
    			append_dev(button0, span0);
    			append_dev(span0, i0);
    			append_dev(button0, t0);
    			append_dev(button0, span1);
    			append_dev(div0, t2);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t3);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div0, t4);
    			append_dev(div0, button1);
    			append_dev(button1, span2);
    			append_dev(span2, i1);
    			append_dev(button1, t5);
    			append_dev(button1, span3);
    			append_dev(div0, t7);
    			append_dev(div0, button2);
    			append_dev(button2, span4);
    			append_dev(span4, i2);
    			append_dev(button2, t8);
    			append_dev(button2, span5);
    			append_dev(div0, t10);
    			if (if_block2) if_block2.m(div0, null);
    			append_dev(div0, t11);
    			if (if_block3) if_block3.m(div0, null);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, div1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*handleEditSession*/ ctx[3], false, false, false),
    					listen_dev(button1, "click", /*handleCancelSession*/ ctx[4], false, false, false),
    					listen_dev(button2, "click", /*handleDeleteSession*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*action_status*/ ctx[2] === 1) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_8(ctx);
    					if_block0.c();
    					if_block0.m(div0, t3);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*action_status*/ ctx[2] === 3) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_7$1(ctx);
    					if_block1.c();
    					if_block1.m(div0, t4);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (!/*data*/ ctx[0].notification) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_6$2(ctx);
    					if_block2.c();
    					if_block2.m(div0, t11);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*data*/ ctx[0].meetingID) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_5$2(ctx);
    					if_block3.c();
    					if_block3.m(div0, null);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2$4.name,
    		type: "else",
    		source: "(277:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (251:6) {#if role === 'user'}
    function create_if_block_2$7(ctx) {
    	let div0;
    	let t0;
    	let t1;
    	let div1;

    	function select_block_type_1(ctx, dirty) {
    		if (/*data*/ ctx[0].isEnrolled) return create_if_block_4$3;
    		return create_else_block_1$4;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*action_status*/ ctx[2] === 3 && /*data*/ ctx[0].isEnrolled && create_if_block_3$5(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "buttons");
    			add_location(div0, file$d, 251, 8, 6644);
    			attr_dev(div1, "class", "field");
    			add_location(div1, file$d, 275, 8, 7473);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			if_block0.m(div0, null);
    			append_dev(div0, t0);
    			if (if_block1) if_block1.m(div0, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div0, t0);
    				}
    			}

    			if (/*action_status*/ ctx[2] === 3 && /*data*/ ctx[0].isEnrolled) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3$5(ctx);
    					if_block1.c();
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$7.name,
    		type: "if",
    		source: "(251:6) {#if role === 'user'}",
    		ctx
    	});

    	return block;
    }

    // (285:10) {#if action_status === 1}
    function create_if_block_8(ctx) {
    	let button;
    	let span0;
    	let i;
    	let t0;
    	let span1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			span0 = element("span");
    			i = element("i");
    			t0 = space();
    			span1 = element("span");
    			span1.textContent = "Start";
    			attr_dev(i, "class", "fas fa-play svelte-1hp1jme");
    			add_location(i, file$d, 289, 34, 7973);
    			attr_dev(span0, "class", "icon");
    			add_location(span0, file$d, 289, 14, 7953);
    			add_location(span1, file$d, 290, 14, 8021);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "button is-link is-active");
    			add_location(button, file$d, 285, 12, 7811);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span0);
    			append_dev(span0, i);
    			append_dev(button, t0);
    			append_dev(button, span1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleStartSession*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(285:10) {#if action_status === 1}",
    		ctx
    	});

    	return block;
    }

    // (294:10) {#if action_status === 3}
    function create_if_block_7$1(ctx) {
    	let button;
    	let span0;
    	let i;
    	let t0;
    	let span1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			span0 = element("span");
    			i = element("i");
    			t0 = space();
    			span1 = element("span");
    			span1.textContent = "Complete";
    			attr_dev(i, "class", "fas fa-stop-circle svelte-1hp1jme");
    			add_location(i, file$d, 298, 34, 8287);
    			attr_dev(span0, "class", "icon");
    			add_location(span0, file$d, 298, 14, 8267);
    			add_location(span1, file$d, 299, 14, 8342);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "button is-link is-active");
    			add_location(button, file$d, 294, 12, 8126);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span0);
    			append_dev(span0, i);
    			append_dev(button, t0);
    			append_dev(button, span1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleStopSession*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$1.name,
    		type: "if",
    		source: "(294:10) {#if action_status === 3}",
    		ctx
    	});

    	return block;
    }

    // (317:10) {#if !data.notification}
    function create_if_block_6$2(ctx) {
    	let button;
    	let span0;
    	let i;
    	let t0;
    	let span1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			span0 = element("span");
    			i = element("i");
    			t0 = space();
    			span1 = element("span");
    			span1.textContent = "Send Notification";
    			attr_dev(i, "class", "fas fa-paper-plane svelte-1hp1jme");
    			add_location(i, file$d, 321, 34, 9120);
    			attr_dev(span0, "class", "icon");
    			add_location(span0, file$d, 321, 14, 9100);
    			add_location(span1, file$d, 322, 14, 9175);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "button is-success");
    			add_location(button, file$d, 317, 12, 8955);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span0);
    			append_dev(span0, i);
    			append_dev(button, t0);
    			append_dev(button, span1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[13], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$2.name,
    		type: "if",
    		source: "(317:10) {#if !data.notification}",
    		ctx
    	});

    	return block;
    }

    // (326:10) {#if data.meetingID}
    function create_if_block_5$2(ctx) {
    	let button;
    	let span0;
    	let i;
    	let t0;
    	let span1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			span0 = element("span");
    			i = element("i");
    			t0 = space();
    			span1 = element("span");
    			span1.textContent = "Open Session";
    			attr_dev(i, "class", "fas fa-user-friends svelte-1hp1jme");
    			add_location(i, file$d, 330, 34, 9444);
    			attr_dev(span0, "class", "icon");
    			add_location(span0, file$d, 330, 14, 9424);
    			add_location(span1, file$d, 331, 14, 9500);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "button is-info");
    			add_location(button, file$d, 326, 12, 9287);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span0);
    			append_dev(span0, i);
    			append_dev(button, t0);
    			append_dev(button, span1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_2*/ ctx[14], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$2.name,
    		type: "if",
    		source: "(326:10) {#if data.meetingID}",
    		ctx
    	});

    	return block;
    }

    // (258:10) {:else}
    function create_else_block_1$4(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Enroll";
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "button is-text");
    			add_location(button, file$d, 258, 12, 6923);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleEnroll*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$4.name,
    		type: "else",
    		source: "(258:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (253:10) {#if data.isEnrolled}
    function create_if_block_4$3(ctx) {
    	let button;
    	let span0;
    	let i;
    	let t0;
    	let span1;

    	const block = {
    		c: function create() {
    			button = element("button");
    			span0 = element("span");
    			i = element("i");
    			t0 = space();
    			span1 = element("span");
    			span1.textContent = "Enrolled";
    			attr_dev(i, "class", "fas fa-circle svelte-1hp1jme");
    			add_location(i, file$d, 254, 43, 6799);
    			attr_dev(span0, "class", "icon enrolled svelte-1hp1jme");
    			add_location(span0, file$d, 254, 14, 6770);
    			add_location(span1, file$d, 255, 14, 6849);
    			attr_dev(button, "class", "button is-danger is-inverted");
    			add_location(button, file$d, 253, 12, 6710);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span0);
    			append_dev(span0, i);
    			append_dev(button, t0);
    			append_dev(button, span1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$3.name,
    		type: "if",
    		source: "(253:10) {#if data.isEnrolled}",
    		ctx
    	});

    	return block;
    }

    // (266:10) {#if action_status === 3 && data.isEnrolled}
    function create_if_block_3$5(ctx) {
    	let button;
    	let span0;
    	let i;
    	let t0;
    	let span1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			span0 = element("span");
    			i = element("i");
    			t0 = space();
    			span1 = element("span");
    			span1.textContent = "Join Session";
    			attr_dev(i, "class", "fas fa-user-friends svelte-1hp1jme");
    			add_location(i, file$d, 270, 34, 7330);
    			attr_dev(span0, "class", "icon");
    			add_location(span0, file$d, 270, 14, 7310);
    			add_location(span1, file$d, 271, 14, 7386);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "button is-info is-inverted");
    			add_location(button, file$d, 266, 12, 7161);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span0);
    			append_dev(span0, i);
    			append_dev(button, t0);
    			append_dev(button, span1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[12], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$5.name,
    		type: "if",
    		source: "(266:10) {#if action_status === 3 && data.isEnrolled}",
    		ctx
    	});

    	return block;
    }

    // (339:4) {#if role === 'user'}
    function create_if_block$9(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let t1_value = /*data*/ ctx[0].presenter + "";
    	let t1;

    	function select_block_type_2(ctx, dirty) {
    		if (/*data*/ ctx[0].photoURL) return create_if_block_1$8;
    		return create_else_block$9;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if_block.c();
    			t0 = space();
    			div0 = element("div");
    			t1 = text(t1_value);
    			attr_dev(div0, "class", "presenter-details");
    			add_location(div0, file$d, 347, 8, 9950);
    			attr_dev(div1, "class", "media-right svelte-1hp1jme");
    			add_location(div1, file$d, 339, 6, 9664);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			if_block.m(div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div1, t0);
    				}
    			}

    			if (dirty & /*data*/ 1 && t1_value !== (t1_value = /*data*/ ctx[0].presenter + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(339:4) {#if role === 'user'}",
    		ctx
    	});

    	return block;
    }

    // (345:8) {:else}
    function create_else_block$9(ctx) {
    	let figure;
    	let i;

    	const block = {
    		c: function create() {
    			figure = element("figure");
    			i = element("i");
    			attr_dev(i, "class", "fas fa-3x fa-user-circle svelte-1hp1jme");
    			add_location(i, file$d, 345, 32, 9880);
    			attr_dev(figure, "class", "image svelte-1hp1jme");
    			add_location(figure, file$d, 345, 10, 9858);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, figure, anchor);
    			append_dev(figure, i);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(figure);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$9.name,
    		type: "else",
    		source: "(345:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (341:8) {#if data.photoURL}
    function create_if_block_1$8(ctx) {
    	let figure;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			figure = element("figure");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*data*/ ctx[0].photoURL)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "profile svelte-1hp1jme");
    			attr_dev(img, "alt", "");
    			add_location(img, file$d, 342, 12, 9764);
    			attr_dev(figure, "class", "figure");
    			add_location(figure, file$d, 341, 10, 9728);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, figure, anchor);
    			append_dev(figure, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1 && !src_url_equal(img.src, img_src_value = /*data*/ ctx[0].photoURL)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(figure);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$8.name,
    		type: "if",
    		source: "(341:8) {#if data.photoURL}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let div8;
    	let article;
    	let div3;
    	let div0;
    	let t0_value = /*data*/ ctx[0].daypart + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2_value = /*data*/ ctx[0].monthpart + "";
    	let t2;
    	let t3;
    	let div2;
    	let t4_value = /*data*/ ctx[0].timepart + "";
    	let t4;
    	let t5;
    	let div7;
    	let div4;
    	let t6_value = /*data*/ ctx[0].title + "";
    	let t6;
    	let t7;
    	let div5;
    	let t8_value = /*data*/ ctx[0].description + "";
    	let t8;
    	let t9;
    	let div6;
    	let t10_value = /*data*/ ctx[0].theme + "";
    	let t10;
    	let t11;
    	let t12;

    	function select_block_type(ctx, dirty) {
    		if (/*role*/ ctx[1] === 'user') return create_if_block_2$7;
    		return create_else_block_2$4;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*role*/ ctx[1] === 'user' && create_if_block$9(ctx);

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			article = element("article");
    			div3 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			div2 = element("div");
    			t4 = text(t4_value);
    			t5 = space();
    			div7 = element("div");
    			div4 = element("div");
    			t6 = text(t6_value);
    			t7 = space();
    			div5 = element("div");
    			t8 = text(t8_value);
    			t9 = space();
    			div6 = element("div");
    			t10 = text(t10_value);
    			t11 = space();
    			if_block0.c();
    			t12 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div0, "class", "session-date svelte-1hp1jme");
    			add_location(div0, file$d, 242, 6, 6240);
    			attr_dev(div1, "class", "session-month svelte-1hp1jme");
    			add_location(div1, file$d, 243, 6, 6293);
    			attr_dev(div2, "class", "session-time svelte-1hp1jme");
    			add_location(div2, file$d, 244, 6, 6349);
    			attr_dev(div3, "class", "medial-left");
    			add_location(div3, file$d, 241, 4, 6208);
    			attr_dev(div4, "class", "session-title svelte-1hp1jme");
    			add_location(div4, file$d, 247, 6, 6446);
    			attr_dev(div5, "class", "session-description svelte-1hp1jme");
    			add_location(div5, file$d, 248, 6, 6498);
    			attr_dev(div6, "class", "session-theme svelte-1hp1jme");
    			add_location(div6, file$d, 249, 6, 6562);
    			attr_dev(div7, "class", "media-content svelte-1hp1jme");
    			add_location(div7, file$d, 246, 4, 6412);
    			attr_dev(article, "class", "media svelte-1hp1jme");
    			add_location(article, file$d, 240, 2, 6180);
    			attr_dev(div8, "class", "box svelte-1hp1jme");
    			add_location(div8, file$d, 239, 0, 6160);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, article);
    			append_dev(article, div3);
    			append_dev(div3, div0);
    			append_dev(div0, t0);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div1, t2);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, t4);
    			append_dev(article, t5);
    			append_dev(article, div7);
    			append_dev(div7, div4);
    			append_dev(div4, t6);
    			append_dev(div7, t7);
    			append_dev(div7, div5);
    			append_dev(div5, t8);
    			append_dev(div7, t9);
    			append_dev(div7, div6);
    			append_dev(div6, t10);
    			append_dev(div7, t11);
    			if_block0.m(div7, null);
    			append_dev(article, t12);
    			if (if_block1) if_block1.m(article, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*data*/ 1 && t0_value !== (t0_value = /*data*/ ctx[0].daypart + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*data*/ 1 && t2_value !== (t2_value = /*data*/ ctx[0].monthpart + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*data*/ 1 && t4_value !== (t4_value = /*data*/ ctx[0].timepart + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*data*/ 1 && t6_value !== (t6_value = /*data*/ ctx[0].title + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*data*/ 1 && t8_value !== (t8_value = /*data*/ ctx[0].description + "")) set_data_dev(t8, t8_value);
    			if (dirty & /*data*/ 1 && t10_value !== (t10_value = /*data*/ ctx[0].theme + "")) set_data_dev(t10, t10_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div7, null);
    				}
    			}

    			if (/*role*/ ctx[1] === 'user') {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$9(ctx);
    					if_block1.c();
    					if_block1.m(article, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let action_status;
    	let $token;
    	let $loggedInUserId;
    	let $isUserLoggedIn;
    	validate_store(token, 'token');
    	component_subscribe($$self, token, $$value => $$invalidate(15, $token = $$value));
    	validate_store(loggedInUserId, 'loggedInUserId');
    	component_subscribe($$self, loggedInUserId, $$value => $$invalidate(16, $loggedInUserId = $$value));
    	validate_store(isUserLoggedIn, 'isUserLoggedIn');
    	component_subscribe($$self, isUserLoggedIn, $$value => $$invalidate(17, $isUserLoggedIn = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Sessioncard', slots, []);
    	let { data = {} } = $$props;
    	let { role = "user" } = $$props;
    	const dispatch = createEventDispatcher();

    	onMount(() => {
    		if (hasKey(data, "enrollments")) {
    			$$invalidate(0, data.isEnrolled = data.enrollments.includes($loggedInUserId), data);
    		}

    		$$invalidate(2, action_status = data.status);
    	});

    	const handleEditSession = () => dispatch("editsession", data);

    	const handleCancelSession = async () => {
    		try {
    			const headers = getAuthHeaders($token);
    			const url = `${apihost}/${appModules.session}/${"cancel"}/${data.id}`;
    			const result = await axios.put(url, data, headers).then(res => res.data);

    			if (result) {
    				$$invalidate(2, action_status = result.status);
    				dispatch("canelsession", result);
    			}
    		} catch(error) {
    			console.error(error);
    		}
    	};

    	const handleStartSession = async () => {
    		try {
    			const headers = getAuthHeaders($token);
    			const url = `${apihost}/${appModules.session}/${"start"}/${data.id}`;
    			const result = await axios.put(url, data, headers).then(res => res.data);

    			if (result) {
    				$$invalidate(0, data.meetingID = result.meetingID, data);
    				$$invalidate(2, action_status = result.status);
    				dispatch("startsession", result);
    			}
    		} catch(error) {
    			console.error(error);
    		}
    	};

    	const handleStopSession = async () => {
    		try {
    			const headers = getAuthHeaders($token);
    			const url = `${apihost}/${appModules.session}/${"complete"}/${data.id}`;
    			const result = await axios.put(url, data, headers).then(res => res.data);

    			if (result) {
    				$$invalidate(2, action_status = result.status);
    				dispatch("stopsession", result);
    			}
    		} catch(error) {
    			console.error(error);
    		}
    	};

    	const handleDeleteSession = async () => {
    		try {
    			const headers = getAuthHeaders($token);
    			const url = `${apihost}/${appModules.session}/${data.id}`;
    			const result = await axios.delete(url, headers).then(res => res.data);

    			if (result) {
    				$$invalidate(2, action_status = result.status);
    				dispatch("deletesession", data);
    			}
    		} catch(error) {
    			console.error(error);
    		}
    	};

    	const handleEnroll = async () => {
    		try {
    			if (!$isUserLoggedIn) {
    				dispatch("handleShowModal", true);
    				return;
    			}

    			const id = $loggedInUserId;
    			const url = `${apihost}/${appModules.session}/enroll/${id}`;
    			const result = await axios.post(url, data, getAuthHeaders($token)).then(res => res.data);

    			if (result) {
    				$$invalidate(0, data.isEnrolled = true, data);
    			}
    		} catch(error) {
    			console.error(error);
    		}
    	};

    	const joinSession = async data => {
    		var win = window.open(`https://${meetinghost}/${data.meetingID}`);
    		win.focus();
    	}; // const api = getExternalJitsiApi(data.meetingid, meetinghost, $appuser);
    	// if (api) {
    	//   document.getElementById("meeting").showModal();
    	//   // styles are dynamically rendered, so need to configure the styles manually.

    	//   setTimeout(() => {
    	//     let iframe = document.querySelector("#meeting > #dialog-body")
    	//       .childNodes[0];
    	//     iframe.style["height"] = "85vh";
    	//   }, 2000);
    	// }
    	const sendNotification = async data => {
    		try {
    			const id = $loggedInUserId;

    			const body = {
    				title: data.title,
    				message: `${data.title} is added`
    			};

    			const url = `${apihost}/${appModules.notify}/${id}`;
    			const result = await axios.post(url, body, getAuthHeaders($token)).then(res => res.data);

    			if (result) {
    				
    			}
    		} catch(error) {
    			console.error(error);
    		}
    	};

    	const openSession = async data => {
    		var win = window.open(`https://${meetinghost}/${data.meetingID}`);
    		win.focus();
    	}; // const api = getExternalJitsiApi(data.meetingid, meetinghost, $appuser);
    	// if (api) {
    	//   document.getElementById("meeting").showModal();
    	//   // styles are dynamically rendered, so need to configure the styles manually.

    	const writable_props = ['data', 'role'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$5.warn(`<Sessioncard> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => joinSession(data);
    	const click_handler_1 = () => sendNotification(data);
    	const click_handler_2 = () => openSession(data);

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('role' in $$props) $$invalidate(1, role = $$props.role);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onMount,
    		axios,
    		apihost,
    		appModules,
    		getAuthHeaders,
    		hasKey,
    		getExternalJitsiApi,
    		meetinghost,
    		token,
    		loggedInUserId,
    		isUserLoggedIn,
    		appuser,
    		data,
    		role,
    		dispatch,
    		handleEditSession,
    		handleCancelSession,
    		handleStartSession,
    		handleStopSession,
    		handleDeleteSession,
    		handleEnroll,
    		joinSession,
    		sendNotification,
    		openSession,
    		action_status,
    		$token,
    		$loggedInUserId,
    		$isUserLoggedIn
    	});

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('role' in $$props) $$invalidate(1, role = $$props.role);
    		if ('action_status' in $$props) $$invalidate(2, action_status = $$props.action_status);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(2, action_status = 1);

    	return [
    		data,
    		role,
    		action_status,
    		handleEditSession,
    		handleCancelSession,
    		handleStartSession,
    		handleStopSession,
    		handleDeleteSession,
    		handleEnroll,
    		joinSession,
    		sendNotification,
    		openSession,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class Sessioncard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$e, create_fragment$e, safe_not_equal, { data: 0, role: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sessioncard",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get data() {
    		throw new Error("<Sessioncard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Sessioncard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get role() {
    		throw new Error("<Sessioncard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set role(value) {
    		throw new Error("<Sessioncard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/components/presentercard.svelte generated by Svelte v3.40.1 */

    const file$c = "src/pages/components/presentercard.svelte";

    // (42:8) {:else}
    function create_else_block$8(ctx) {
    	let span;
    	let i;

    	const block = {
    		c: function create() {
    			span = element("span");
    			i = element("i");
    			attr_dev(i, "class", "far fa-3x fa-user-circle");
    			add_location(i, file$c, 43, 12, 742);
    			add_location(span, file$c, 42, 10, 723);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, i);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$8.name,
    		type: "else",
    		source: "(42:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (40:8) {#if data.photoURL}
    function create_if_block$8(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*data*/ ctx[0].photoURL)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "profile svelte-zqvgun");
    			attr_dev(img, "alt", "");
    			add_location(img, file$c, 40, 10, 646);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1 && !src_url_equal(img.src, img_src_value = /*data*/ ctx[0].photoURL)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(40:8) {#if data.photoURL}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let article;
    	let div4;
    	let div0;
    	let figure;
    	let t0;
    	let div3;
    	let div2;
    	let div1;
    	let p0;
    	let t1_value = /*data*/ ctx[0].displayName + "";
    	let t1;
    	let t2;
    	let p1;
    	let t3_value = /*data*/ ctx[0].email + "";
    	let t3;
    	let article_id_value;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*data*/ ctx[0].photoURL) return create_if_block$8;
    		return create_else_block$8;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			article = element("article");
    			div4 = element("div");
    			div0 = element("div");
    			figure = element("figure");
    			if_block.c();
    			t0 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			p0 = element("p");
    			t1 = text(t1_value);
    			t2 = space();
    			p1 = element("p");
    			t3 = text(t3_value);
    			attr_dev(figure, "class", "figure profilepic svelte-zqvgun");
    			add_location(figure, file$c, 38, 6, 573);
    			attr_dev(div0, "class", "card-image svelte-zqvgun");
    			add_location(div0, file$c, 37, 4, 542);
    			attr_dev(p0, "class", "title is-4");
    			add_location(p0, file$c, 52, 10, 944);
    			attr_dev(p1, "class", "subtitle is-6");
    			add_location(p1, file$c, 53, 10, 999);
    			attr_dev(div1, "class", "media-content");
    			add_location(div1, file$c, 51, 8, 906);
    			attr_dev(div2, "class", "media");
    			add_location(div2, file$c, 50, 6, 878);
    			attr_dev(div3, "class", "card-content svelte-zqvgun");
    			add_location(div3, file$c, 49, 4, 845);
    			attr_dev(div4, "class", "card svelte-zqvgun");
    			add_location(div4, file$c, 36, 2, 519);
    			attr_dev(article, "id", article_id_value = /*data*/ ctx[0].id);
    			attr_dev(article, "class", "grid-item bd svelte-zqvgun");
    			toggle_class(article, "active", /*current*/ ctx[1].id === /*data*/ ctx[0].id);
    			add_location(article, file$c, 31, 0, 418);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, div4);
    			append_dev(div4, div0);
    			append_dev(div0, figure);
    			if_block.m(figure, null);
    			append_dev(div4, t0);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, p0);
    			append_dev(p0, t1);
    			append_dev(div1, t2);
    			append_dev(div1, p1);
    			append_dev(p1, t3);

    			if (!mounted) {
    				dispose = listen_dev(article, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(figure, null);
    				}
    			}

    			if (dirty & /*data*/ 1 && t1_value !== (t1_value = /*data*/ ctx[0].displayName + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*data*/ 1 && t3_value !== (t3_value = /*data*/ ctx[0].email + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*data*/ 1 && article_id_value !== (article_id_value = /*data*/ ctx[0].id)) {
    				attr_dev(article, "id", article_id_value);
    			}

    			if (dirty & /*current, data*/ 3) {
    				toggle_class(article, "active", /*current*/ ctx[1].id === /*data*/ ctx[0].id);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Presentercard', slots, []);
    	let { data } = $$props;
    	let { current } = $$props;
    	const writable_props = ['data', 'current'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Presentercard> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('current' in $$props) $$invalidate(1, current = $$props.current);
    	};

    	$$self.$capture_state = () => ({ data, current });

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('current' in $$props) $$invalidate(1, current = $$props.current);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, current, click_handler];
    }

    class Presentercard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$d, create_fragment$d, safe_not_equal, { data: 0, current: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Presentercard",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !('data' in props)) {
    			console.warn("<Presentercard> was created without expected prop 'data'");
    		}

    		if (/*current*/ ctx[1] === undefined && !('current' in props)) {
    			console.warn("<Presentercard> was created without expected prop 'current'");
    		}
    	}

    	get data() {
    		throw new Error("<Presentercard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Presentercard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get current() {
    		throw new Error("<Presentercard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set current(value) {
    		throw new Error("<Presentercard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/components/addpresenter.svelte generated by Svelte v3.40.1 */

    const { console: console_1$4 } = globals;

    const file$b = "src/pages/components/addpresenter.svelte";

    // (65:6) {#if close === 'true'}
    function create_if_block_4$2(ctx) {
    	let header;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			header = element("header");
    			button = element("button");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "delete");
    			attr_dev(button, "aria-label", "close");
    			add_location(button, file$b, 66, 10, 1783);
    			attr_dev(header, "class", "is-pulled-right");
    			add_location(header, file$b, 65, 8, 1740);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleClose*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$2.name,
    		type: "if",
    		source: "(65:6) {#if close === 'true'}",
    		ctx
    	});

    	return block;
    }

    // (84:14) {:else}
    function create_else_block$7(ctx) {
    	let label;
    	let span;
    	let i;

    	const block = {
    		c: function create() {
    			label = element("label");
    			span = element("span");
    			i = element("i");
    			attr_dev(i, "class", "far fa-3x fa-user-circle");
    			add_location(i, file$b, 90, 20, 2652);
    			add_location(span, file$b, 89, 18, 2625);
    			attr_dev(label, "class", "image");
    			attr_dev(label, "title", "click on image to upload");
    			attr_dev(label, "for", "profilepic");
    			set_style(label, "font-size", "3.4rem");
    			set_style(label, "text-align", "center");
    			set_style(label, "cursor", "pointer");
    			add_location(label, file$b, 84, 16, 2403);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, span);
    			append_dev(span, i);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$7.name,
    		type: "else",
    		source: "(84:14) {:else}",
    		ctx
    	});

    	return block;
    }

    // (80:14) {#if presenterdata.photoURL}
    function create_if_block_3$4(ctx) {
    	let figure;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			figure = element("figure");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*presenterdata*/ ctx[0].photoURL)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "profile svelte-gtd3ih");
    			attr_dev(img, "alt", "");
    			add_location(img, file$b, 81, 18, 2282);
    			attr_dev(figure, "class", "figure");
    			add_location(figure, file$b, 80, 16, 2240);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, figure, anchor);
    			append_dev(figure, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*presenterdata*/ 1 && !src_url_equal(img.src, img_src_value = /*presenterdata*/ ctx[0].photoURL)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(figure);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$4.name,
    		type: "if",
    		source: "(80:14) {#if presenterdata.photoURL}",
    		ctx
    	});

    	return block;
    }

    // (259:10) {#if add === 'true'}
    function create_if_block_2$6(ctx) {
    	let div0;
    	let label0;
    	let t0;
    	let input0;
    	let t1;
    	let div1;
    	let label1;
    	let t2;
    	let input1;
    	let t3;
    	let div3;
    	let div2;
    	let button;
    	let span0;
    	let i;
    	let t4;
    	let span1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			label0 = element("label");
    			t0 = text("New User\n                ");
    			input0 = element("input");
    			t1 = space();
    			div1 = element("div");
    			label1 = element("label");
    			t2 = text("Existing User\n                ");
    			input1 = element("input");
    			t3 = space();
    			div3 = element("div");
    			div2 = element("div");
    			button = element("button");
    			span0 = element("span");
    			i = element("i");
    			t4 = space();
    			span1 = element("span");
    			span1.textContent = "Submit";
    			attr_dev(input0, "type", "radio");
    			attr_dev(input0, "name", "usercategory");
    			input0.__value = "new_user";
    			input0.value = input0.__value;
    			attr_dev(input0, "title", "Allow user to login with this email");
    			input0.required = true;
    			/*$$binding_groups*/ ctx[21][0].push(input0);
    			add_location(input0, file$b, 262, 16, 8289);
    			attr_dev(label0, "class", "label");
    			set_style(label0, "cursor", "pointer");
    			add_location(label0, file$b, 260, 14, 8202);
    			attr_dev(div0, "class", "field");
    			add_location(div0, file$b, 259, 12, 8168);
    			attr_dev(input1, "type", "radio");
    			attr_dev(input1, "name", "usercategory");
    			input1.__value = "existing_user";
    			input1.value = input1.__value;
    			attr_dev(input1, "title", "Are you making existing user as presenter");
    			input1.required = true;
    			/*$$binding_groups*/ ctx[21][0].push(input1);
    			add_location(input1, file$b, 274, 16, 8730);
    			attr_dev(label1, "class", "label");
    			set_style(label1, "cursor", "pointer");
    			add_location(label1, file$b, 272, 14, 8638);
    			attr_dev(div1, "class", "field");
    			add_location(div1, file$b, 271, 12, 8604);
    			attr_dev(i, "class", "fas fa-save");
    			add_location(i, file$b, 287, 20, 9235);
    			attr_dev(span0, "class", "icon");
    			add_location(span0, file$b, 286, 18, 9195);
    			add_location(span1, file$b, 289, 18, 9305);
    			attr_dev(button, "class", "button is-primary");
    			attr_dev(button, "type", "submit");
    			add_location(button, file$b, 285, 16, 9128);
    			attr_dev(div2, "class", "control");
    			add_location(div2, file$b, 284, 14, 9090);
    			attr_dev(div3, "class", "field");
    			add_location(div3, file$b, 283, 12, 9056);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, label0);
    			append_dev(label0, t0);
    			append_dev(label0, input0);
    			input0.checked = input0.__value === /*presenterdata*/ ctx[0].usercategory;
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, label1);
    			append_dev(label1, t2);
    			append_dev(label1, input1);
    			input1.checked = input1.__value === /*presenterdata*/ ctx[0].usercategory;
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, button);
    			append_dev(button, span0);
    			append_dev(span0, i);
    			append_dev(button, t4);
    			append_dev(button, span1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*input0_change_handler*/ ctx[20]),
    					listen_dev(input1, "change", /*input1_change_handler*/ ctx[22])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*presenterdata*/ 1) {
    				input0.checked = input0.__value === /*presenterdata*/ ctx[0].usercategory;
    			}

    			if (dirty & /*presenterdata*/ 1) {
    				input1.checked = input1.__value === /*presenterdata*/ ctx[0].usercategory;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			/*$$binding_groups*/ ctx[21][0].splice(/*$$binding_groups*/ ctx[21][0].indexOf(input0), 1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			/*$$binding_groups*/ ctx[21][0].splice(/*$$binding_groups*/ ctx[21][0].indexOf(input1), 1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$6.name,
    		type: "if",
    		source: "(259:10) {#if add === 'true'}",
    		ctx
    	});

    	return block;
    }

    // (295:10) {#if edit === 'true'}
    function create_if_block$7(ctx) {
    	let div1;
    	let div0;
    	let button;
    	let span0;
    	let i;
    	let t0;
    	let span1;
    	let t2;
    	let if_block = /*admin*/ ctx[4] === 'true' && create_if_block_1$7(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			button = element("button");
    			span0 = element("span");
    			i = element("i");
    			t0 = space();
    			span1 = element("span");
    			span1.textContent = "Save Changes";
    			t2 = space();
    			if (if_block) if_block.c();
    			attr_dev(i, "class", "far fa-save");
    			add_location(i, file$b, 299, 20, 9632);
    			attr_dev(span0, "class", "icon");
    			add_location(span0, file$b, 298, 18, 9592);
    			add_location(span1, file$b, 301, 18, 9702);
    			attr_dev(button, "class", "button is-primary");
    			add_location(button, file$b, 297, 16, 9539);
    			attr_dev(div0, "class", "buttons is-pulled-right");
    			add_location(div0, file$b, 296, 14, 9485);
    			attr_dev(div1, "class", "field");
    			add_location(div1, file$b, 295, 12, 9451);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, button);
    			append_dev(button, span0);
    			append_dev(span0, i);
    			append_dev(button, t0);
    			append_dev(button, span1);
    			append_dev(div0, t2);
    			if (if_block) if_block.m(div0, null);
    		},
    		p: function update(ctx, dirty) {
    			if (/*admin*/ ctx[4] === 'true') {
    				if (if_block) ; else {
    					if_block = create_if_block_1$7(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(295:10) {#if edit === 'true'}",
    		ctx
    	});

    	return block;
    }

    // (304:16) {#if admin === 'true'}
    function create_if_block_1$7(ctx) {
    	let button;
    	let span0;
    	let i;
    	let t0;
    	let span1;

    	const block = {
    		c: function create() {
    			button = element("button");
    			span0 = element("span");
    			i = element("i");
    			t0 = space();
    			span1 = element("span");
    			span1.textContent = "Remove Presenter";
    			attr_dev(i, "class", "fas fa-trash");
    			add_location(i, file$b, 306, 22, 9907);
    			attr_dev(span0, "class", "icon");
    			add_location(span0, file$b, 305, 20, 9865);
    			add_location(span1, file$b, 308, 20, 9982);
    			attr_dev(button, "class", "button is-danger");
    			add_location(button, file$b, 304, 18, 9811);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span0);
    			append_dev(span0, i);
    			append_dev(button, t0);
    			append_dev(button, span1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$7.name,
    		type: "if",
    		source: "(304:16) {#if admin === 'true'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let section;
    	let form;
    	let div28;
    	let t0;
    	let article;
    	let div12;
    	let div1;
    	let div0;
    	let t1;
    	let label0;
    	let span;
    	let t3;
    	let input0;
    	let t4;
    	let div3;
    	let label1;
    	let t6;
    	let div2;
    	let input1;
    	let t7;
    	let div5;
    	let label2;
    	let t9;
    	let div4;
    	let input2;
    	let t10;
    	let div7;
    	let label3;
    	let t12;
    	let div6;
    	let input3;
    	let t13;
    	let div9;
    	let label4;
    	let t15;
    	let div8;
    	let textarea;
    	let t16;
    	let div11;
    	let label5;
    	let t18;
    	let div10;
    	let input4;
    	let t19;
    	let div27;
    	let div14;
    	let label6;
    	let t21;
    	let div13;
    	let input5;
    	let t22;
    	let div16;
    	let label7;
    	let t24;
    	let div15;
    	let input6;
    	let t25;
    	let div18;
    	let label8;
    	let t27;
    	let div17;
    	let input7;
    	let t28;
    	let div20;
    	let label9;
    	let t30;
    	let div19;
    	let input8;
    	let t31;
    	let div22;
    	let label10;
    	let t33;
    	let div21;
    	let input9;
    	let t34;
    	let div24;
    	let label11;
    	let t36;
    	let div23;
    	let input10;
    	let t37;
    	let div26;
    	let label12;
    	let t39;
    	let div25;
    	let input11;
    	let t40;
    	let t41;
    	let mounted;
    	let dispose;
    	let if_block0 = /*close*/ ctx[3] === 'true' && create_if_block_4$2(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*presenterdata*/ ctx[0].photoURL) return create_if_block_3$4;
    		return create_else_block$7;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);
    	let if_block2 = /*add*/ ctx[1] === 'true' && create_if_block_2$6(ctx);
    	let if_block3 = /*edit*/ ctx[2] === 'true' && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			form = element("form");
    			div28 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			article = element("article");
    			div12 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			if_block1.c();
    			t1 = space();
    			label0 = element("label");
    			span = element("span");
    			span.textContent = "* click on image to update";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			div3 = element("div");
    			label1 = element("label");
    			label1.textContent = "Full Name";
    			t6 = space();
    			div2 = element("div");
    			input1 = element("input");
    			t7 = space();
    			div5 = element("div");
    			label2 = element("label");
    			label2.textContent = "Email";
    			t9 = space();
    			div4 = element("div");
    			input2 = element("input");
    			t10 = space();
    			div7 = element("div");
    			label3 = element("label");
    			label3.textContent = "Phone";
    			t12 = space();
    			div6 = element("div");
    			input3 = element("input");
    			t13 = space();
    			div9 = element("div");
    			label4 = element("label");
    			label4.textContent = "Description";
    			t15 = space();
    			div8 = element("div");
    			textarea = element("textarea");
    			t16 = space();
    			div11 = element("div");
    			label5 = element("label");
    			label5.textContent = "Date of birth";
    			t18 = space();
    			div10 = element("div");
    			input4 = element("input");
    			t19 = space();
    			div27 = element("div");
    			div14 = element("div");
    			label6 = element("label");
    			label6.textContent = "Education";
    			t21 = space();
    			div13 = element("div");
    			input5 = element("input");
    			t22 = space();
    			div16 = element("div");
    			label7 = element("label");
    			label7.textContent = "Skills";
    			t24 = space();
    			div15 = element("div");
    			input6 = element("input");
    			t25 = space();
    			div18 = element("div");
    			label8 = element("label");
    			label8.textContent = "College";
    			t27 = space();
    			div17 = element("div");
    			input7 = element("input");
    			t28 = space();
    			div20 = element("div");
    			label9 = element("label");
    			label9.textContent = "Address";
    			t30 = space();
    			div19 = element("div");
    			input8 = element("input");
    			t31 = space();
    			div22 = element("div");
    			label10 = element("label");
    			label10.textContent = "City";
    			t33 = space();
    			div21 = element("div");
    			input9 = element("input");
    			t34 = space();
    			div24 = element("div");
    			label11 = element("label");
    			label11.textContent = "State";
    			t36 = space();
    			div23 = element("div");
    			input10 = element("input");
    			t37 = space();
    			div26 = element("div");
    			label12 = element("label");
    			label12.textContent = "Country";
    			t39 = space();
    			div25 = element("div");
    			input11 = element("input");
    			t40 = space();
    			if (if_block2) if_block2.c();
    			t41 = space();
    			if (if_block3) if_block3.c();
    			attr_dev(span, "name", "note");
    			attr_dev(span, "class", "has-text-danger has-text-weight-bold is-size-7");
    			add_location(span, file$b, 95, 16, 2812);
    			attr_dev(label0, "for", "note ");
    			add_location(label0, file$b, 94, 14, 2776);
    			attr_dev(input0, "class", "input is-hidden");
    			attr_dev(input0, "type", "file");
    			attr_dev(input0, "name", "profilepic");
    			attr_dev(input0, "accept", "image/x-png,image/jpg,image/jpeg");
    			attr_dev(input0, "id", "profilepic");
    			add_location(input0, file$b, 101, 14, 3028);
    			attr_dev(div0, "class", "control");
    			set_style(div0, "text-align", "center");
    			add_location(div0, file$b, 78, 12, 2132);
    			attr_dev(div1, "class", "field");
    			add_location(div1, file$b, 77, 10, 2100);
    			attr_dev(label1, "class", "label");
    			add_location(label1, file$b, 111, 12, 3356);
    			attr_dev(input1, "class", "input");
    			attr_dev(input1, "name", "displayname");
    			attr_dev(input1, "type", "text");
    			input1.required = true;
    			attr_dev(input1, "placeholder", "Presenter Fullname");
    			add_location(input1, file$b, 113, 14, 3443);
    			attr_dev(div2, "class", "control");
    			add_location(div2, file$b, 112, 12, 3407);
    			attr_dev(div3, "class", "field");
    			add_location(div3, file$b, 110, 10, 3324);
    			attr_dev(label2, "class", "label");
    			add_location(label2, file$b, 123, 12, 3753);
    			attr_dev(input2, "class", "input");
    			attr_dev(input2, "type", "email");
    			attr_dev(input2, "name", "email");
    			input2.required = true;
    			attr_dev(input2, "placeholder", "Presenter Email");
    			add_location(input2, file$b, 125, 14, 3836);
    			attr_dev(div4, "class", "control");
    			add_location(div4, file$b, 124, 12, 3800);
    			attr_dev(div5, "class", "field");
    			add_location(div5, file$b, 122, 10, 3721);
    			attr_dev(label3, "class", "label");
    			add_location(label3, file$b, 135, 12, 4132);
    			attr_dev(input3, "class", "input");
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "name", "phone");
    			input3.required = true;
    			attr_dev(input3, "placeholder", "+1234567890");
    			add_location(input3, file$b, 137, 14, 4215);
    			attr_dev(div6, "class", "control");
    			add_location(div6, file$b, 136, 12, 4179);
    			attr_dev(div7, "class", "field");
    			add_location(div7, file$b, 134, 10, 4100);
    			attr_dev(label4, "class", "label");
    			add_location(label4, file$b, 147, 12, 4506);
    			attr_dev(textarea, "class", "input");
    			attr_dev(textarea, "type", "text");
    			attr_dev(textarea, "name", "description");
    			textarea.required = true;
    			attr_dev(textarea, "placeholder", "Enter bio about presenter");
    			add_location(textarea, file$b, 149, 14, 4595);
    			attr_dev(div8, "class", "control");
    			add_location(div8, file$b, 148, 12, 4559);
    			attr_dev(div9, "class", "field");
    			add_location(div9, file$b, 146, 10, 4474);
    			attr_dev(label5, "class", "label");
    			add_location(label5, file$b, 159, 12, 4915);
    			attr_dev(input4, "class", "input");
    			attr_dev(input4, "type", "date");
    			attr_dev(input4, "name", "dateofbirth");
    			input4.required = true;
    			attr_dev(input4, "placeholder", "Presenter Birthday");
    			add_location(input4, file$b, 161, 14, 5006);
    			attr_dev(div10, "class", "control");
    			add_location(div10, file$b, 160, 12, 4970);
    			attr_dev(div11, "class", "field");
    			add_location(div11, file$b, 158, 10, 4883);
    			attr_dev(div12, "class", "media-left");
    			set_style(div12, "width", "50%");
    			set_style(div12, "margin-right", "0rem", 1);
    			set_style(div12, "padding", "10px");
    			add_location(div12, file$b, 74, 8, 1981);
    			attr_dev(label6, "class", "label");
    			add_location(label6, file$b, 175, 12, 5448);
    			attr_dev(input5, "class", "input");
    			attr_dev(input5, "type", "text");
    			attr_dev(input5, "name", "education");
    			input5.required = true;
    			attr_dev(input5, "placeholder", "Highest Education Details");
    			add_location(input5, file$b, 177, 14, 5535);
    			attr_dev(div13, "class", "control");
    			add_location(div13, file$b, 176, 12, 5499);
    			attr_dev(div14, "class", "field");
    			add_location(div14, file$b, 174, 10, 5416);
    			attr_dev(label7, "class", "label");
    			add_location(label7, file$b, 187, 12, 5848);
    			attr_dev(input6, "class", "input");
    			attr_dev(input6, "type", "text");
    			attr_dev(input6, "name", "skills");
    			input6.required = true;
    			attr_dev(input6, "placeholder", "Enter skills with comma separated");
    			add_location(input6, file$b, 189, 14, 5932);
    			attr_dev(div15, "class", "control");
    			add_location(div15, file$b, 188, 12, 5896);
    			attr_dev(div16, "class", "field");
    			add_location(div16, file$b, 186, 10, 5816);
    			attr_dev(label8, "class", "label");
    			add_location(label8, file$b, 199, 12, 6247);
    			attr_dev(input7, "class", "input");
    			attr_dev(input7, "type", "text");
    			attr_dev(input7, "name", "college");
    			input7.required = true;
    			attr_dev(input7, "placeholder", "Highest College Details");
    			add_location(input7, file$b, 201, 14, 6332);
    			attr_dev(div17, "class", "control");
    			add_location(div17, file$b, 200, 12, 6296);
    			attr_dev(div18, "class", "field");
    			add_location(div18, file$b, 198, 10, 6215);
    			attr_dev(label9, "class", "label");
    			add_location(label9, file$b, 211, 12, 6639);
    			attr_dev(input8, "class", "input");
    			attr_dev(input8, "type", "text");
    			attr_dev(input8, "name", "address");
    			input8.required = true;
    			attr_dev(input8, "placeholder", "Presenter Address");
    			add_location(input8, file$b, 213, 14, 6724);
    			attr_dev(div19, "class", "control");
    			add_location(div19, file$b, 212, 12, 6688);
    			attr_dev(div20, "class", "field");
    			add_location(div20, file$b, 210, 10, 6607);
    			attr_dev(label10, "class", "label");
    			add_location(label10, file$b, 223, 12, 7025);
    			attr_dev(input9, "class", "input");
    			attr_dev(input9, "type", "text");
    			attr_dev(input9, "name", "city");
    			input9.required = true;
    			attr_dev(input9, "placeholder", "Upload profile pic");
    			add_location(input9, file$b, 225, 14, 7107);
    			attr_dev(div21, "class", "control");
    			add_location(div21, file$b, 224, 12, 7071);
    			attr_dev(div22, "class", "field");
    			add_location(div22, file$b, 222, 10, 6993);
    			attr_dev(label11, "class", "label");
    			add_location(label11, file$b, 235, 12, 7403);
    			attr_dev(input10, "class", "input");
    			attr_dev(input10, "type", "text");
    			attr_dev(input10, "name", "state");
    			input10.required = true;
    			attr_dev(input10, "placeholder", "Presenter State");
    			add_location(input10, file$b, 237, 14, 7486);
    			attr_dev(div23, "class", "control");
    			add_location(div23, file$b, 236, 12, 7450);
    			attr_dev(div24, "class", "field");
    			add_location(div24, file$b, 234, 10, 7371);
    			attr_dev(label12, "class", "label");
    			add_location(label12, file$b, 247, 12, 7781);
    			attr_dev(input11, "class", "input");
    			attr_dev(input11, "type", "text");
    			attr_dev(input11, "name", "country");
    			input11.required = true;
    			attr_dev(input11, "placeholder", "Presenter Country");
    			add_location(input11, file$b, 249, 14, 7866);
    			attr_dev(div25, "class", "control");
    			add_location(div25, file$b, 248, 12, 7830);
    			attr_dev(div26, "class", "field");
    			add_location(div26, file$b, 246, 10, 7749);
    			attr_dev(div27, "class", "media-right");
    			set_style(div27, "width", "50%");
    			set_style(div27, "margin-left", "0rem", 1);
    			set_style(div27, "padding", "20px");
    			add_location(div27, file$b, 171, 8, 5297);
    			attr_dev(article, "class", "media");
    			add_location(article, file$b, 73, 6, 1949);
    			attr_dev(div28, "class", "box");
    			add_location(div28, file$b, 63, 4, 1685);
    			attr_dev(form, "name", "addpresenter");
    			add_location(form, file$b, 62, 2, 1614);
    			add_location(section, file$b, 61, 0, 1602);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, form);
    			append_dev(form, div28);
    			if (if_block0) if_block0.m(div28, null);
    			append_dev(div28, t0);
    			append_dev(div28, article);
    			append_dev(article, div12);
    			append_dev(div12, div1);
    			append_dev(div1, div0);
    			if_block1.m(div0, null);
    			append_dev(div0, t1);
    			append_dev(div0, label0);
    			append_dev(label0, span);
    			append_dev(div0, t3);
    			append_dev(div0, input0);
    			append_dev(div12, t4);
    			append_dev(div12, div3);
    			append_dev(div3, label1);
    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			append_dev(div2, input1);
    			set_input_value(input1, /*presenterdata*/ ctx[0].displayName);
    			append_dev(div12, t7);
    			append_dev(div12, div5);
    			append_dev(div5, label2);
    			append_dev(div5, t9);
    			append_dev(div5, div4);
    			append_dev(div4, input2);
    			set_input_value(input2, /*presenterdata*/ ctx[0].email);
    			append_dev(div12, t10);
    			append_dev(div12, div7);
    			append_dev(div7, label3);
    			append_dev(div7, t12);
    			append_dev(div7, div6);
    			append_dev(div6, input3);
    			set_input_value(input3, /*presenterdata*/ ctx[0].phone);
    			append_dev(div12, t13);
    			append_dev(div12, div9);
    			append_dev(div9, label4);
    			append_dev(div9, t15);
    			append_dev(div9, div8);
    			append_dev(div8, textarea);
    			set_input_value(textarea, /*presenterdata*/ ctx[0].description);
    			append_dev(div12, t16);
    			append_dev(div12, div11);
    			append_dev(div11, label5);
    			append_dev(div11, t18);
    			append_dev(div11, div10);
    			append_dev(div10, input4);
    			set_input_value(input4, /*presenterdata*/ ctx[0].dateofbirth);
    			append_dev(article, t19);
    			append_dev(article, div27);
    			append_dev(div27, div14);
    			append_dev(div14, label6);
    			append_dev(div14, t21);
    			append_dev(div14, div13);
    			append_dev(div13, input5);
    			set_input_value(input5, /*presenterdata*/ ctx[0].education);
    			append_dev(div27, t22);
    			append_dev(div27, div16);
    			append_dev(div16, label7);
    			append_dev(div16, t24);
    			append_dev(div16, div15);
    			append_dev(div15, input6);
    			set_input_value(input6, /*presenterdata*/ ctx[0].skills);
    			append_dev(div27, t25);
    			append_dev(div27, div18);
    			append_dev(div18, label8);
    			append_dev(div18, t27);
    			append_dev(div18, div17);
    			append_dev(div17, input7);
    			set_input_value(input7, /*presenterdata*/ ctx[0].college);
    			append_dev(div27, t28);
    			append_dev(div27, div20);
    			append_dev(div20, label9);
    			append_dev(div20, t30);
    			append_dev(div20, div19);
    			append_dev(div19, input8);
    			set_input_value(input8, /*presenterdata*/ ctx[0].address);
    			append_dev(div27, t31);
    			append_dev(div27, div22);
    			append_dev(div22, label10);
    			append_dev(div22, t33);
    			append_dev(div22, div21);
    			append_dev(div21, input9);
    			set_input_value(input9, /*presenterdata*/ ctx[0].city);
    			append_dev(div27, t34);
    			append_dev(div27, div24);
    			append_dev(div24, label11);
    			append_dev(div24, t36);
    			append_dev(div24, div23);
    			append_dev(div23, input10);
    			set_input_value(input10, /*presenterdata*/ ctx[0].state);
    			append_dev(div27, t37);
    			append_dev(div27, div26);
    			append_dev(div26, label12);
    			append_dev(div26, t39);
    			append_dev(div26, div25);
    			append_dev(div25, input11);
    			set_input_value(input11, /*presenterdata*/ ctx[0].country);
    			append_dev(div27, t40);
    			if (if_block2) if_block2.m(div27, null);
    			append_dev(div27, t41);
    			if (if_block3) if_block3.m(div27, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*handleProfileUpload*/ ctx[7], false, false, false),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[8]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[9]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[10]),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[11]),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[12]),
    					listen_dev(input5, "input", /*input5_input_handler*/ ctx[13]),
    					listen_dev(input6, "input", /*input6_input_handler*/ ctx[14]),
    					listen_dev(input7, "input", /*input7_input_handler*/ ctx[15]),
    					listen_dev(input8, "input", /*input8_input_handler*/ ctx[16]),
    					listen_dev(input9, "input", /*input9_input_handler*/ ctx[17]),
    					listen_dev(input10, "input", /*input10_input_handler*/ ctx[18]),
    					listen_dev(input11, "input", /*input11_input_handler*/ ctx[19]),
    					listen_dev(form, "submit", prevent_default(/*handleSubmit*/ ctx[5]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*close*/ ctx[3] === 'true') {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4$2(ctx);
    					if_block0.c();
    					if_block0.m(div28, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div0, t1);
    				}
    			}

    			if (dirty & /*presenterdata*/ 1 && input1.value !== /*presenterdata*/ ctx[0].displayName) {
    				set_input_value(input1, /*presenterdata*/ ctx[0].displayName);
    			}

    			if (dirty & /*presenterdata*/ 1 && input2.value !== /*presenterdata*/ ctx[0].email) {
    				set_input_value(input2, /*presenterdata*/ ctx[0].email);
    			}

    			if (dirty & /*presenterdata*/ 1 && input3.value !== /*presenterdata*/ ctx[0].phone) {
    				set_input_value(input3, /*presenterdata*/ ctx[0].phone);
    			}

    			if (dirty & /*presenterdata*/ 1) {
    				set_input_value(textarea, /*presenterdata*/ ctx[0].description);
    			}

    			if (dirty & /*presenterdata*/ 1) {
    				set_input_value(input4, /*presenterdata*/ ctx[0].dateofbirth);
    			}

    			if (dirty & /*presenterdata*/ 1 && input5.value !== /*presenterdata*/ ctx[0].education) {
    				set_input_value(input5, /*presenterdata*/ ctx[0].education);
    			}

    			if (dirty & /*presenterdata*/ 1 && input6.value !== /*presenterdata*/ ctx[0].skills) {
    				set_input_value(input6, /*presenterdata*/ ctx[0].skills);
    			}

    			if (dirty & /*presenterdata*/ 1 && input7.value !== /*presenterdata*/ ctx[0].college) {
    				set_input_value(input7, /*presenterdata*/ ctx[0].college);
    			}

    			if (dirty & /*presenterdata*/ 1 && input8.value !== /*presenterdata*/ ctx[0].address) {
    				set_input_value(input8, /*presenterdata*/ ctx[0].address);
    			}

    			if (dirty & /*presenterdata*/ 1 && input9.value !== /*presenterdata*/ ctx[0].city) {
    				set_input_value(input9, /*presenterdata*/ ctx[0].city);
    			}

    			if (dirty & /*presenterdata*/ 1 && input10.value !== /*presenterdata*/ ctx[0].state) {
    				set_input_value(input10, /*presenterdata*/ ctx[0].state);
    			}

    			if (dirty & /*presenterdata*/ 1 && input11.value !== /*presenterdata*/ ctx[0].country) {
    				set_input_value(input11, /*presenterdata*/ ctx[0].country);
    			}

    			if (/*add*/ ctx[1] === 'true') {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_2$6(ctx);
    					if_block2.c();
    					if_block2.m(div27, t41);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*edit*/ ctx[2] === 'true') {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block$7(ctx);
    					if_block3.c();
    					if_block3.m(div27, null);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let $token;
    	validate_store(token, 'token');
    	component_subscribe($$self, token, $$value => $$invalidate(23, $token = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Addpresenter', slots, []);
    	const dispatch = createEventDispatcher();
    	let { add = "true" } = $$props;
    	let { edit = "false" } = $$props;
    	let { close = "false" } = $$props;
    	let { admin = "true" } = $$props;
    	let { presenterdata = {} } = $$props;

    	onMount(() => {
    		if (hasKey(presenterdata, "dateofbirth")) {
    			$$invalidate(0, presenterdata["dateofbirth"] = presenterdata["dateofbirth"].split("T")[0], presenterdata);
    		}
    	});

    	const handleSubmit = async () => dispatch("submitpresenter", presenterdata);

    	const handleClose = async e => {
    		e.preventDefault();
    		dispatch("closeAddPresenter", { close: true });
    	};

    	const handleProfileUpload = async e => {
    		try {
    			const file = e.target.files[0];
    			const res = await getBase64(file);

    			const body = {
    				filename: file.name,
    				profile: res,
    				imagebucket: "avatar",
    				fileExtention: file.type
    			};

    			const url = `${apihost}/${appModules.upload}/${presenterdata.id}`;
    			const headers = getAuthHeaders($token);
    			const result = await axios.post(url, body, headers).then(res => res.data);
    			console.log(result);

    			if (result) {
    				$$invalidate(0, presenterdata = {
    					...presenterdata,
    					photoURL: result.photoURL
    				});
    			}
    		} catch(error) {
    			console.error(error);
    		}
    	};

    	const writable_props = ['add', 'edit', 'close', 'admin', 'presenterdata'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$4.warn(`<Addpresenter> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];

    	function input1_input_handler() {
    		presenterdata.displayName = this.value;
    		$$invalidate(0, presenterdata);
    	}

    	function input2_input_handler() {
    		presenterdata.email = this.value;
    		$$invalidate(0, presenterdata);
    	}

    	function input3_input_handler() {
    		presenterdata.phone = this.value;
    		$$invalidate(0, presenterdata);
    	}

    	function textarea_input_handler() {
    		presenterdata.description = this.value;
    		$$invalidate(0, presenterdata);
    	}

    	function input4_input_handler() {
    		presenterdata.dateofbirth = this.value;
    		$$invalidate(0, presenterdata);
    	}

    	function input5_input_handler() {
    		presenterdata.education = this.value;
    		$$invalidate(0, presenterdata);
    	}

    	function input6_input_handler() {
    		presenterdata.skills = this.value;
    		$$invalidate(0, presenterdata);
    	}

    	function input7_input_handler() {
    		presenterdata.college = this.value;
    		$$invalidate(0, presenterdata);
    	}

    	function input8_input_handler() {
    		presenterdata.address = this.value;
    		$$invalidate(0, presenterdata);
    	}

    	function input9_input_handler() {
    		presenterdata.city = this.value;
    		$$invalidate(0, presenterdata);
    	}

    	function input10_input_handler() {
    		presenterdata.state = this.value;
    		$$invalidate(0, presenterdata);
    	}

    	function input11_input_handler() {
    		presenterdata.country = this.value;
    		$$invalidate(0, presenterdata);
    	}

    	function input0_change_handler() {
    		presenterdata.usercategory = this.__value;
    		$$invalidate(0, presenterdata);
    	}

    	function input1_change_handler() {
    		presenterdata.usercategory = this.__value;
    		$$invalidate(0, presenterdata);
    	}

    	$$self.$$set = $$props => {
    		if ('add' in $$props) $$invalidate(1, add = $$props.add);
    		if ('edit' in $$props) $$invalidate(2, edit = $$props.edit);
    		if ('close' in $$props) $$invalidate(3, close = $$props.close);
    		if ('admin' in $$props) $$invalidate(4, admin = $$props.admin);
    		if ('presenterdata' in $$props) $$invalidate(0, presenterdata = $$props.presenterdata);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onMount,
    		axios,
    		token,
    		appuser,
    		hasKey,
    		getBase64,
    		apihost,
    		appModules,
    		getAuthHeaders,
    		dispatch,
    		add,
    		edit,
    		close,
    		admin,
    		presenterdata,
    		handleSubmit,
    		handleClose,
    		handleProfileUpload,
    		$token
    	});

    	$$self.$inject_state = $$props => {
    		if ('add' in $$props) $$invalidate(1, add = $$props.add);
    		if ('edit' in $$props) $$invalidate(2, edit = $$props.edit);
    		if ('close' in $$props) $$invalidate(3, close = $$props.close);
    		if ('admin' in $$props) $$invalidate(4, admin = $$props.admin);
    		if ('presenterdata' in $$props) $$invalidate(0, presenterdata = $$props.presenterdata);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		presenterdata,
    		add,
    		edit,
    		close,
    		admin,
    		handleSubmit,
    		handleClose,
    		handleProfileUpload,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		textarea_input_handler,
    		input4_input_handler,
    		input5_input_handler,
    		input6_input_handler,
    		input7_input_handler,
    		input8_input_handler,
    		input9_input_handler,
    		input10_input_handler,
    		input11_input_handler,
    		input0_change_handler,
    		$$binding_groups,
    		input1_change_handler
    	];
    }

    class Addpresenter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init$1(this, options, instance$c, create_fragment$c, safe_not_equal, {
    			add: 1,
    			edit: 2,
    			close: 3,
    			admin: 4,
    			presenterdata: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Addpresenter",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get add() {
    		throw new Error("<Addpresenter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set add(value) {
    		throw new Error("<Addpresenter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get edit() {
    		throw new Error("<Addpresenter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set edit(value) {
    		throw new Error("<Addpresenter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get close() {
    		throw new Error("<Addpresenter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set close(value) {
    		throw new Error("<Addpresenter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get admin() {
    		throw new Error("<Addpresenter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set admin(value) {
    		throw new Error("<Addpresenter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get presenterdata() {
    		throw new Error("<Addpresenter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set presenterdata(value) {
    		throw new Error("<Addpresenter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/components/addsession.svelte generated by Svelte v3.40.1 */

    const { console: console_1$3 } = globals;

    const file$a = "src/pages/components/addsession.svelte";

    // (190:6) {#if add === 'true'}
    function create_if_block_1$6(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*role*/ ctx[1] === appRoles.admin) return create_if_block_2$5;
    		return create_else_block$6;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(190:6) {#if add === 'true'}",
    		ctx
    	});

    	return block;
    }

    // (202:8) {:else}
    function create_else_block$6(ctx) {
    	let div1;
    	let div0;
    	let button;
    	let span0;
    	let i;
    	let t0;
    	let span1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			button = element("button");
    			span0 = element("span");
    			i = element("i");
    			t0 = space();
    			span1 = element("span");
    			span1.textContent = "Submit Request";
    			attr_dev(i, "class", "fas fa-save");
    			add_location(i, file$a, 209, 18, 6362);
    			attr_dev(span0, "class", "icon is-small");
    			add_location(span0, file$a, 208, 16, 6315);
    			add_location(span1, file$a, 211, 16, 6428);
    			attr_dev(button, "class", "button is-primary");
    			attr_dev(button, "type", "button");
    			add_location(button, file$a, 204, 14, 6171);
    			attr_dev(div0, "class", "control");
    			add_location(div0, file$a, 203, 12, 6135);
    			attr_dev(div1, "class", "field mr10 svelte-1osuisu");
    			add_location(div1, file$a, 202, 10, 6098);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, button);
    			append_dev(button, span0);
    			append_dev(span0, i);
    			append_dev(button, t0);
    			append_dev(button, span1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleSubmitRequest*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$6.name,
    		type: "else",
    		source: "(202:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (191:8) {#if role === appRoles.admin}
    function create_if_block_2$5(ctx) {
    	let div1;
    	let div0;
    	let button;
    	let span0;
    	let i;
    	let t0;
    	let span1;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			button = element("button");
    			span0 = element("span");
    			i = element("i");
    			t0 = space();
    			span1 = element("span");
    			span1.textContent = "Submit";
    			attr_dev(i, "class", "fas fa-save");
    			add_location(i, file$a, 195, 18, 5926);
    			attr_dev(span0, "class", "icon is-small");
    			add_location(span0, file$a, 194, 16, 5879);
    			add_location(span1, file$a, 197, 16, 5992);
    			attr_dev(button, "class", "button is-primary");
    			attr_dev(button, "type", "submit");
    			add_location(button, file$a, 193, 14, 5814);
    			attr_dev(div0, "class", "control");
    			add_location(div0, file$a, 192, 12, 5778);
    			attr_dev(div1, "class", "field mr10 svelte-1osuisu");
    			add_location(div1, file$a, 191, 10, 5741);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, button);
    			append_dev(button, span0);
    			append_dev(span0, i);
    			append_dev(button, t0);
    			append_dev(button, span1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$5.name,
    		type: "if",
    		source: "(191:8) {#if role === appRoles.admin}",
    		ctx
    	});

    	return block;
    }

    // (218:6) {#if edit === 'true'}
    function create_if_block$6(ctx) {
    	let div1;
    	let div0;
    	let button;
    	let span0;
    	let i;
    	let t0;
    	let span1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			button = element("button");
    			span0 = element("span");
    			i = element("i");
    			t0 = space();
    			span1 = element("span");
    			span1.textContent = "Save Changes";
    			attr_dev(i, "class", "far fa-save");
    			add_location(i, file$a, 225, 16, 6820);
    			attr_dev(span0, "class", "icon");
    			add_location(span0, file$a, 224, 14, 6784);
    			add_location(span1, file$a, 227, 14, 6882);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "button is-primary");
    			add_location(button, file$a, 220, 12, 6647);
    			attr_dev(div0, "class", "buttons");
    			add_location(div0, file$a, 219, 10, 6613);
    			attr_dev(div1, "class", "field mr10 svelte-1osuisu");
    			add_location(div1, file$a, 218, 8, 6578);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, button);
    			append_dev(button, span0);
    			append_dev(span0, i);
    			append_dev(button, t0);
    			append_dev(button, span1);

    			if (!mounted) {
    				dispose = listen_dev(button, "submit", /*handleSessionSubmit*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(218:6) {#if edit === 'true'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div12;
    	let form;
    	let header;
    	let button;
    	let t0;
    	let div8;
    	let div1;
    	let label0;
    	let t2;
    	let div0;
    	let input0;
    	let t3;
    	let div3;
    	let label1;
    	let t5;
    	let div2;
    	let textarea;
    	let t6;
    	let div5;
    	let label2;
    	let t8;
    	let div4;
    	let input1;
    	let t9;
    	let div7;
    	let label3;
    	let t11;
    	let div6;
    	let input2;
    	let t12;
    	let div11;
    	let div9;
    	let label4;
    	let input3;
    	let t13;
    	let t14;
    	let div10;
    	let label5;
    	let input4;
    	let t15;
    	let t16;
    	let t17;
    	let mounted;
    	let dispose;
    	let if_block0 = /*add*/ ctx[2] === 'true' && create_if_block_1$6(ctx);
    	let if_block1 = /*edit*/ ctx[3] === 'true' && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			div12 = element("div");
    			form = element("form");
    			header = element("header");
    			button = element("button");
    			t0 = space();
    			div8 = element("div");
    			div1 = element("div");
    			label0 = element("label");
    			label0.textContent = "Title";
    			t2 = space();
    			div0 = element("div");
    			input0 = element("input");
    			t3 = space();
    			div3 = element("div");
    			label1 = element("label");
    			label1.textContent = "Description";
    			t5 = space();
    			div2 = element("div");
    			textarea = element("textarea");
    			t6 = space();
    			div5 = element("div");
    			label2 = element("label");
    			label2.textContent = "Scheduled Date";
    			t8 = space();
    			div4 = element("div");
    			input1 = element("input");
    			t9 = space();
    			div7 = element("div");
    			label3 = element("label");
    			label3.textContent = "Theme";
    			t11 = space();
    			div6 = element("div");
    			input2 = element("input");
    			t12 = space();
    			div11 = element("div");
    			div9 = element("div");
    			label4 = element("label");
    			input3 = element("input");
    			t13 = text("\n          You Tube Streaming");
    			t14 = space();
    			div10 = element("div");
    			label5 = element("label");
    			input4 = element("input");
    			t15 = text("\n          Send Notification");
    			t16 = space();
    			if (if_block0) if_block0.c();
    			t17 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "delete");
    			attr_dev(button, "aria-label", "close");
    			add_location(button, file$a, 112, 6, 3452);
    			attr_dev(header, "class", "is-pulled-right");
    			add_location(header, file$a, 111, 4, 3413);
    			attr_dev(label0, "class", "label");
    			add_location(label0, file$a, 120, 8, 3662);
    			attr_dev(input0, "class", "input");
    			attr_dev(input0, "name", "title");
    			attr_dev(input0, "type", "text");
    			input0.required = true;
    			attr_dev(input0, "placeholder", "Session Title");
    			add_location(input0, file$a, 122, 10, 3737);
    			attr_dev(div0, "class", "control");
    			add_location(div0, file$a, 121, 8, 3705);
    			attr_dev(div1, "class", "field w25 mr10 svelte-1osuisu");
    			add_location(div1, file$a, 119, 6, 3625);
    			attr_dev(label1, "class", "label");
    			add_location(label1, file$a, 132, 8, 3997);
    			attr_dev(textarea, "class", "input");
    			attr_dev(textarea, "type", "text");
    			attr_dev(textarea, "name", "description");
    			textarea.required = true;
    			attr_dev(textarea, "placeholder", "Session description");
    			add_location(textarea, file$a, 134, 10, 4078);
    			attr_dev(div2, "class", "control");
    			add_location(div2, file$a, 133, 8, 4046);
    			attr_dev(div3, "class", "field w25 mr10 svelte-1osuisu");
    			add_location(div3, file$a, 131, 6, 3960);
    			attr_dev(label2, "class", "label");
    			add_location(label2, file$a, 144, 8, 4359);
    			attr_dev(input1, "class", "input");
    			attr_dev(input1, "type", "datetime-local");
    			attr_dev(input1, "name", "scheduledon");
    			attr_dev(input1, "min", /*minDate*/ ctx[4]);
    			input1.required = true;
    			attr_dev(input1, "placeholder", "Scheduled Date");
    			add_location(input1, file$a, 146, 10, 4443);
    			attr_dev(div4, "class", "control");
    			add_location(div4, file$a, 145, 8, 4411);
    			attr_dev(div5, "class", "field w25 mr10 svelte-1osuisu");
    			add_location(div5, file$a, 143, 6, 4322);
    			attr_dev(label3, "class", "label");
    			add_location(label3, file$a, 157, 8, 4752);
    			attr_dev(input2, "class", "input");
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "name", "theme");
    			input2.required = true;
    			attr_dev(input2, "placeholder", "Session Theme");
    			add_location(input2, file$a, 159, 10, 4827);
    			attr_dev(div6, "class", "control");
    			add_location(div6, file$a, 158, 8, 4795);
    			attr_dev(div7, "class", "field w25 mr10 svelte-1osuisu");
    			add_location(div7, file$a, 156, 6, 4715);
    			attr_dev(div8, "class", "container flex-start svelte-1osuisu");
    			add_location(div8, file$a, 118, 4, 3584);
    			attr_dev(input3, "name", "category");
    			attr_dev(input3, "type", "checkbox");
    			add_location(input3, file$a, 172, 10, 5219);
    			attr_dev(label4, "class", "label");
    			set_style(label4, "cursor", "pointer");
    			add_location(label4, file$a, 171, 8, 5163);
    			attr_dev(div9, "class", "field mr10 svelte-1osuisu");
    			add_location(div9, file$a, 170, 6, 5130);
    			attr_dev(input4, "name", "category");
    			attr_dev(input4, "type", "checkbox");
    			add_location(input4, file$a, 181, 10, 5489);
    			attr_dev(label5, "class", "label");
    			set_style(label5, "cursor", "pointer");
    			add_location(label5, file$a, 180, 8, 5433);
    			attr_dev(div10, "class", "field mr10 svelte-1osuisu");
    			add_location(div10, file$a, 179, 6, 5400);
    			attr_dev(div11, "class", "container flex-start svelte-1osuisu");
    			set_style(div11, "align-items", "flex-end");
    			add_location(div11, file$a, 169, 4, 5059);
    			attr_dev(form, "name", "addsession");
    			add_location(form, file$a, 110, 2, 3337);
    			attr_dev(div12, "class", "box");
    			add_location(div12, file$a, 109, 0, 3317);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div12, anchor);
    			append_dev(div12, form);
    			append_dev(form, header);
    			append_dev(header, button);
    			append_dev(form, t0);
    			append_dev(form, div8);
    			append_dev(div8, div1);
    			append_dev(div1, label0);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, input0);
    			set_input_value(input0, /*sessiondata*/ ctx[0].title);
    			append_dev(div8, t3);
    			append_dev(div8, div3);
    			append_dev(div3, label1);
    			append_dev(div3, t5);
    			append_dev(div3, div2);
    			append_dev(div2, textarea);
    			set_input_value(textarea, /*sessiondata*/ ctx[0].description);
    			append_dev(div8, t6);
    			append_dev(div8, div5);
    			append_dev(div5, label2);
    			append_dev(div5, t8);
    			append_dev(div5, div4);
    			append_dev(div4, input1);
    			set_input_value(input1, /*sessiondata*/ ctx[0].scheduledon);
    			append_dev(div8, t9);
    			append_dev(div8, div7);
    			append_dev(div7, label3);
    			append_dev(div7, t11);
    			append_dev(div7, div6);
    			append_dev(div6, input2);
    			set_input_value(input2, /*sessiondata*/ ctx[0].theme);
    			append_dev(form, t12);
    			append_dev(form, div11);
    			append_dev(div11, div9);
    			append_dev(div9, label4);
    			append_dev(label4, input3);
    			input3.checked = /*sessiondata*/ ctx[0].livestream;
    			append_dev(label4, t13);
    			append_dev(div11, t14);
    			append_dev(div11, div10);
    			append_dev(div10, label5);
    			append_dev(label5, input4);
    			input4.checked = /*sessiondata*/ ctx[0].notification;
    			append_dev(label5, t15);
    			append_dev(div11, t16);
    			if (if_block0) if_block0.m(div11, null);
    			append_dev(div11, t17);
    			if (if_block1) if_block1.m(div11, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*handleClose*/ ctx[7], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[9]),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[10]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[11]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[12]),
    					listen_dev(input3, "change", /*input3_change_handler*/ ctx[13]),
    					listen_dev(input4, "change", /*input4_change_handler*/ ctx[14]),
    					listen_dev(form, "submit", prevent_default(/*handleSessionSubmit*/ ctx[5]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*sessiondata*/ 1 && input0.value !== /*sessiondata*/ ctx[0].title) {
    				set_input_value(input0, /*sessiondata*/ ctx[0].title);
    			}

    			if (dirty & /*sessiondata*/ 1) {
    				set_input_value(textarea, /*sessiondata*/ ctx[0].description);
    			}

    			if (dirty & /*sessiondata*/ 1) {
    				set_input_value(input1, /*sessiondata*/ ctx[0].scheduledon);
    			}

    			if (dirty & /*sessiondata*/ 1 && input2.value !== /*sessiondata*/ ctx[0].theme) {
    				set_input_value(input2, /*sessiondata*/ ctx[0].theme);
    			}

    			if (dirty & /*sessiondata*/ 1) {
    				input3.checked = /*sessiondata*/ ctx[0].livestream;
    			}

    			if (dirty & /*sessiondata*/ 1) {
    				input4.checked = /*sessiondata*/ ctx[0].notification;
    			}

    			if (/*add*/ ctx[2] === 'true') {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$6(ctx);
    					if_block0.c();
    					if_block0.m(div11, t17);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*edit*/ ctx[3] === 'true') {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$6(ctx);
    					if_block1.c();
    					if_block1.m(div11, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div12);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $token;
    	validate_store(token, 'token');
    	component_subscribe($$self, token, $$value => $$invalidate(15, $token = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Addsession', slots, []);
    	const dispatch = createEventDispatcher();
    	let { role = "user" } = $$props;
    	let { add = "true" } = $$props;
    	let { edit = "false" } = $$props;
    	let { sessiondata = {} } = $$props;
    	let { currentpresenter = {} } = $$props;
    	let today = new Date();
    	let minDate = today.toISOString().slice(0, 16);
    	console.log(minDate);

    	onMount(() => {
    		console.log(currentpresenter);

    		if (hasKey(sessiondata, "scheduledon")) {
    			$$invalidate(0, sessiondata["scheduledon"] = sessiondata["scheduledon"].slice(0, 16), sessiondata);
    		}
    	});

    	const handleSessionSubmit = async () => {
    		// after save dispatch to parent to update list
    		console.log(role);

    		try {
    			let url = "";
    			const headers = getAuthHeaders($token);
    			const updateObj = removeUnusedFields(sessiondata, session_remove);

    			const data = {
    				...updateObj,
    				presenter: currentpresenter.displayName,
    				presenterid: currentpresenter.id,
    				photoURL: currentpresenter.photoURL
    			}; // session with presenter info.

    			if (hasKey(sessiondata, "id")) {
    				url = `${apihost}/${appModules.session}/${sessiondata.id}`;
    				data.createdby = currentpresenter.id;
    				data.updatedby = currentpresenter.id;
    				const result = await axios.put(url, data, headers).then(res => res.data);
    				const sessionwithdate = getDateParts(result, "scheduledon");
    				dispatch("submitsession", { isadd: false, ...sessionwithdate });
    			} else {
    				url = `${apihost}/${appModules.session}`;
    				data.createdby = currentpresenter.id;
    				data.updatedby = currentpresenter.id;
    				const result = await axios.post(url, data, headers).then(res => res.data);
    				const sessionwithdate = getDateParts(result, "scheduledon");
    				dispatch("submitsession", { isadd: true, ...sessionwithdate });
    			}
    		} catch(error) {
    			console.log(error);
    		}
    	};

    	const handleSubmitRequest = async () => {
    		try {
    			let url = "";
    			const headers = getAuthHeaders($token);
    			const updateObj = removeUnusedFields(sessiondata, session_remove);

    			const data = {
    				...updateObj,
    				presenter: currentpresenter.displayName,
    				presenterid: currentpresenter.id,
    				photoURL: currentpresenter.photoURL
    			}; // session with presenter info.

    			url = `${apihost}/${appModules.sessionrequest}`;
    			data.status = 100;
    			data.createdby = currentpresenter.id;
    			data.updatedby = currentpresenter.id;
    			const result = await axios.post(url, data, headers).then(res => res.data);
    			dispatch("submitrequest", result);
    		} catch(error) {
    			console.log(error);
    		}
    	};

    	const handleClose = async e => {
    		e.preventDefault();
    		dispatch("closeaddsession", { close: true });
    	};

    	const writable_props = ['role', 'add', 'edit', 'sessiondata', 'currentpresenter'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$3.warn(`<Addsession> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		sessiondata.title = this.value;
    		$$invalidate(0, sessiondata);
    	}

    	function textarea_input_handler() {
    		sessiondata.description = this.value;
    		$$invalidate(0, sessiondata);
    	}

    	function input1_input_handler() {
    		sessiondata.scheduledon = this.value;
    		$$invalidate(0, sessiondata);
    	}

    	function input2_input_handler() {
    		sessiondata.theme = this.value;
    		$$invalidate(0, sessiondata);
    	}

    	function input3_change_handler() {
    		sessiondata.livestream = this.checked;
    		$$invalidate(0, sessiondata);
    	}

    	function input4_change_handler() {
    		sessiondata.notification = this.checked;
    		$$invalidate(0, sessiondata);
    	}

    	$$self.$$set = $$props => {
    		if ('role' in $$props) $$invalidate(1, role = $$props.role);
    		if ('add' in $$props) $$invalidate(2, add = $$props.add);
    		if ('edit' in $$props) $$invalidate(3, edit = $$props.edit);
    		if ('sessiondata' in $$props) $$invalidate(0, sessiondata = $$props.sessiondata);
    		if ('currentpresenter' in $$props) $$invalidate(8, currentpresenter = $$props.currentpresenter);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onMount,
    		axios,
    		appRoles,
    		token,
    		current_presenter,
    		hasKey,
    		apihost,
    		appModules,
    		getAuthHeaders,
    		getDateParts,
    		session_remove,
    		removeUnusedFields,
    		dispatch,
    		role,
    		add,
    		edit,
    		sessiondata,
    		currentpresenter,
    		today,
    		minDate,
    		handleSessionSubmit,
    		handleSubmitRequest,
    		handleClose,
    		$token
    	});

    	$$self.$inject_state = $$props => {
    		if ('role' in $$props) $$invalidate(1, role = $$props.role);
    		if ('add' in $$props) $$invalidate(2, add = $$props.add);
    		if ('edit' in $$props) $$invalidate(3, edit = $$props.edit);
    		if ('sessiondata' in $$props) $$invalidate(0, sessiondata = $$props.sessiondata);
    		if ('currentpresenter' in $$props) $$invalidate(8, currentpresenter = $$props.currentpresenter);
    		if ('today' in $$props) today = $$props.today;
    		if ('minDate' in $$props) $$invalidate(4, minDate = $$props.minDate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		sessiondata,
    		role,
    		add,
    		edit,
    		minDate,
    		handleSessionSubmit,
    		handleSubmitRequest,
    		handleClose,
    		currentpresenter,
    		input0_input_handler,
    		textarea_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_change_handler,
    		input4_change_handler
    	];
    }

    class Addsession extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init$1(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			role: 1,
    			add: 2,
    			edit: 3,
    			sessiondata: 0,
    			currentpresenter: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Addsession",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get role() {
    		throw new Error("<Addsession>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set role(value) {
    		throw new Error("<Addsession>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get add() {
    		throw new Error("<Addsession>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set add(value) {
    		throw new Error("<Addsession>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get edit() {
    		throw new Error("<Addsession>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set edit(value) {
    		throw new Error("<Addsession>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sessiondata() {
    		throw new Error("<Addsession>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sessiondata(value) {
    		throw new Error("<Addsession>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentpresenter() {
    		throw new Error("<Addsession>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentpresenter(value) {
    		throw new Error("<Addsession>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/components/unauthorized.svelte generated by Svelte v3.40.1 */
    const file$9 = "src/pages/components/unauthorized.svelte";

    function create_fragment$a(ctx) {
    	let div3;
    	let div0;
    	let figure;
    	let img;
    	let img_src_value;
    	let t;
    	let div2;
    	let div1;
    	let titlebar;
    	let current;

    	titlebar = new Title({
    			props: {
    				iserror: /*iserror*/ ctx[1],
    				message: /*message*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			figure = element("figure");
    			img = element("img");
    			t = space();
    			div2 = element("div");
    			div1 = element("div");
    			create_component(titlebar.$$.fragment);
    			if (!src_url_equal(img.src, img_src_value = /*src*/ ctx[2])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "maahita logo");
    			add_location(img, file$9, 23, 6, 435);
    			attr_dev(figure, "class", "image svelte-w7wjl3");
    			add_location(figure, file$9, 22, 4, 406);
    			attr_dev(div0, "class", "card-image");
    			add_location(div0, file$9, 21, 2, 377);
    			attr_dev(div1, "class", "content");
    			add_location(div1, file$9, 27, 4, 524);
    			attr_dev(div2, "class", "card-content");
    			add_location(div2, file$9, 26, 2, 493);
    			attr_dev(div3, "class", "card svelte-w7wjl3");
    			add_location(div3, file$9, 20, 0, 356);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, figure);
    			append_dev(figure, img);
    			append_dev(div3, t);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			mount_component(titlebar, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const titlebar_changes = {};
    			if (dirty & /*iserror*/ 2) titlebar_changes.iserror = /*iserror*/ ctx[1];
    			if (dirty & /*message*/ 1) titlebar_changes.message = /*message*/ ctx[0];
    			titlebar.$set(titlebar_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(titlebar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(titlebar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(titlebar);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Unauthorized', slots, []);
    	let { message = "you are not authorized to view the content" } = $$props;
    	let { iserror = true } = $$props;
    	let src = "/images/logo.png";
    	const writable_props = ['message', 'iserror'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Unauthorized> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('message' in $$props) $$invalidate(0, message = $$props.message);
    		if ('iserror' in $$props) $$invalidate(1, iserror = $$props.iserror);
    	};

    	$$self.$capture_state = () => ({ TitleBar: Title, message, iserror, src });

    	$$self.$inject_state = $$props => {
    		if ('message' in $$props) $$invalidate(0, message = $$props.message);
    		if ('iserror' in $$props) $$invalidate(1, iserror = $$props.iserror);
    		if ('src' in $$props) $$invalidate(2, src = $$props.src);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [message, iserror, src];
    }

    class Unauthorized extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$a, create_fragment$a, safe_not_equal, { message: 0, iserror: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Unauthorized",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get message() {
    		throw new Error("<Unauthorized>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set message(value) {
    		throw new Error("<Unauthorized>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iserror() {
    		throw new Error("<Unauthorized>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iserror(value) {
    		throw new Error("<Unauthorized>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/components/meeting.svelte generated by Svelte v3.40.1 */

    const file$8 = "src/pages/components/meeting.svelte";

    function create_fragment$9(ctx) {
    	let dialog;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;

    	const block = {
    		c: function create() {
    			dialog = element("dialog");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			div2 = element("div");
    			attr_dev(div0, "class", "dialog-headeer");
    			attr_dev(div0, "id", "dialog-header");
    			add_location(div0, file$8, 10, 2, 125);
    			attr_dev(div1, "class", "dialog-body");
    			attr_dev(div1, "id", "dialog-body");
    			add_location(div1, file$8, 11, 2, 177);
    			attr_dev(div2, "class", "dialog-footer");
    			attr_dev(div2, "id", "dialog-footer");
    			add_location(div2, file$8, 12, 2, 224);
    			attr_dev(dialog, "id", "meeting");
    			attr_dev(dialog, "class", "svelte-1vpsknv");
    			add_location(dialog, file$8, 9, 0, 101);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, dialog, anchor);
    			append_dev(dialog, div0);
    			append_dev(dialog, t0);
    			append_dev(dialog, div1);
    			append_dev(dialog, t1);
    			append_dev(dialog, div2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(dialog);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Meeting', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Meeting> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Meeting extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Meeting",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* src/pages/components/notify.svelte generated by Svelte v3.40.1 */
    const file$7 = "src/pages/components/notify.svelte";

    function create_fragment$8(ctx) {
    	let div;
    	let button;
    	let t0;
    	let t1_value = /*config*/ ctx[0].message + "";
    	let t1;
    	let div_class_value;
    	let div_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			t0 = space();
    			t1 = text(t1_value);
    			attr_dev(button, "class", "delete");
    			add_location(button, file$7, 38, 2, 782);
    			attr_dev(div, "class", div_class_value = "notification is-light " + /*config*/ ctx[0].cssClass + " svelte-1gtwm06");
    			add_location(div, file$7, 35, 0, 685);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*closeNotifiy*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*config*/ 1) && t1_value !== (t1_value = /*config*/ ctx[0].message + "")) set_data_dev(t1, t1_value);

    			if (!current || dirty & /*config*/ 1 && div_class_value !== (div_class_value = "notification is-light " + /*config*/ ctx[0].cssClass + " svelte-1gtwm06")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 1000 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 1000 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Notify', slots, []);
    	const dispatch = createEventDispatcher();
    	let { config = {} } = $$props;
    	const closeNotifiy = () => dispatch("closenotify", false);
    	const writable_props = ['config'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Notify> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('config' in $$props) $$invalidate(0, config = $$props.config);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		createEventDispatcher,
    		dispatch,
    		config,
    		closeNotifiy
    	});

    	$$self.$inject_state = $$props => {
    		if ('config' in $$props) $$invalidate(0, config = $$props.config);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [config, closeNotifiy];
    }

    class Notify extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$8, create_fragment$8, safe_not_equal, { config: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Notify",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get config() {
    		throw new Error("<Notify>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set config(value) {
    		throw new Error("<Notify>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/admin/index.svelte generated by Svelte v3.40.1 */

    const { console: console_1$2 } = globals;
    const file$6 = "src/pages/admin/index.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[26] = list[i];
    	return child_ctx;
    }

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	return child_ctx;
    }

    // (343:0) {:else}
    function create_else_block_4$1(ctx) {
    	let div;
    	let unauthorizedview;
    	let current;

    	unauthorizedview = new Unauthorized({
    			props: {
    				message: "You are not authorized to view the content"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(unauthorizedview.$$.fragment);
    			add_location(div, file$6, 343, 2, 10967);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(unauthorizedview, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(unauthorizedview.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(unauthorizedview.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(unauthorizedview);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_4$1.name,
    		type: "else",
    		source: "(343:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (227:0) {#if $isAdmin}
    function create_if_block$5(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$5, create_else_block$5];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*module_config*/ ctx[0].is_loading) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(227:0) {#if $isAdmin}",
    		ctx
    	});

    	return block;
    }

    // (232:2) {:else}
    function create_else_block$5(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block0;
    	let t0;
    	let meeting;
    	let t1;
    	let if_block1_anchor;
    	let current;
    	const if_block_creators = [create_if_block_3$3, create_else_block_1$3];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (!/*module_config*/ ctx[0].show_presenter_info) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	meeting = new Meeting({ $$inline: true });
    	let if_block1 = /*module_config*/ ctx[0].show_notification && create_if_block_2$4(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block0.c();
    			t0 = space();
    			create_component(meeting.$$.fragment);
    			t1 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(div, "class", "columns");
    			set_style(div, "padding-left", "2rem");
    			set_style(div, "padding-right", "2rem");
    			set_style(div, "padding-top", "2rem");
    			add_location(div, file$6, 232, 4, 6900);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			insert_dev(target, t0, anchor);
    			mount_component(meeting, target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(div, null);
    			}

    			if (/*module_config*/ ctx[0].show_notification) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*module_config*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_2$4(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(meeting.$$.fragment, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(meeting.$$.fragment, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    			if (detaching) detach_dev(t0);
    			destroy_component(meeting, detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(232:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (228:2) {#if module_config.is_loading}
    function create_if_block_1$5(ctx) {
    	let div;
    	let progressbar;
    	let current;

    	progressbar = new Progressbar({
    			props: { module: "presenters" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(progressbar.$$.fragment);
    			attr_dev(div, "class", "container svelte-1uso8");
    			add_location(div, file$6, 228, 4, 6809);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(progressbar, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progressbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progressbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(progressbar);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(228:2) {#if module_config.is_loading}",
    		ctx
    	});

    	return block;
    }

    // (276:6) {:else}
    function create_else_block_1$3(ctx) {
    	let div1;
    	let div0;
    	let button;
    	let t1;
    	let addpresenterview;
    	let t2;
    	let div2;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;

    	addpresenterview = new Addpresenter({
    			props: {
    				presenterdata: /*$current_presenter*/ ctx[4],
    				admin: "true",
    				add: "false",
    				close: "false",
    				edit: "true"
    			},
    			$$inline: true
    		});

    	addpresenterview.$on("submitpresenter", /*handleAddPresenter*/ ctx[8]);
    	const if_block_creators = [create_if_block_5$1, create_else_block_2$3];
    	const if_blocks = [];

    	function select_block_type_3(ctx, dirty) {
    		if (/*module_config*/ ctx[0].is_presenter_sessions_loading) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_3(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			button = element("button");
    			button.textContent = "Go Back";
    			t1 = space();
    			create_component(addpresenterview.$$.fragment);
    			t2 = space();
    			div2 = element("div");
    			if_block.c();
    			attr_dev(button, "class", "button is-text");
    			add_location(button, file$6, 278, 12, 8488);
    			attr_dev(div0, "class", "back");
    			add_location(div0, file$6, 277, 10, 8457);
    			attr_dev(div1, "class", "column is-half");
    			add_location(div1, file$6, 276, 8, 8418);
    			attr_dev(div2, "class", "column is-half");
    			add_location(div2, file$6, 288, 8, 8823);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, button);
    			append_dev(div1, t1);
    			mount_component(addpresenterview, div1, null);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div2, anchor);
    			if_blocks[current_block_type_index].m(div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*goback*/ ctx[14], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const addpresenterview_changes = {};
    			if (dirty & /*$current_presenter*/ 16) addpresenterview_changes.presenterdata = /*$current_presenter*/ ctx[4];
    			addpresenterview.$set(addpresenterview_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_3(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div2, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(addpresenterview.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(addpresenterview.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(addpresenterview);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div2);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$3.name,
    		type: "else",
    		source: "(276:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (236:6) {#if !module_config.show_presenter_info}
    function create_if_block_3$3(ctx) {
    	let div5;
    	let div2;
    	let div0;
    	let titlebar;
    	let t0;
    	let div1;
    	let button;
    	let span0;
    	let i;
    	let t1;
    	let span1;
    	let t3;
    	let div4;
    	let div3;
    	let div5_class_value;
    	let t4;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;

    	titlebar = new Title({
    			props: { message: "Active presenters in maahita" },
    			$$inline: true
    		});

    	let each_value = /*$presenters*/ ctx[6];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block = /*module_config*/ ctx[0].add_new_presenter && create_if_block_4$1(ctx);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			create_component(titlebar.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			button = element("button");
    			span0 = element("span");
    			i = element("i");
    			t1 = space();
    			span1 = element("span");
    			span1.textContent = " Add Presenter";
    			t3 = space();
    			div4 = element("div");
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			add_location(div0, file$6, 240, 12, 7213);
    			attr_dev(i, "class", "fas fa-user");
    			add_location(i, file$6, 246, 18, 7436);
    			add_location(span0, file$6, 245, 16, 7411);
    			add_location(span1, file$6, 248, 16, 7502);
    			attr_dev(button, "class", "button is-primary");
    			add_location(button, file$6, 244, 14, 7336);
    			add_location(div1, file$6, 243, 12, 7316);
    			set_style(div2, "display", "flex");
    			set_style(div2, "justify-content", "space-evenly");
    			set_style(div2, "align-items", "center");
    			add_location(div2, file$6, 237, 10, 7099);
    			attr_dev(div3, "class", "grid-container container svelte-1uso8");
    			add_location(div3, file$6, 253, 12, 7636);
    			attr_dev(div4, "class", "grid svelte-1uso8");
    			add_location(div4, file$6, 252, 10, 7605);
    			attr_dev(div5, "class", div5_class_value = "" + (null_to_empty(/*cssClasses*/ ctx[2].join(' ')) + " svelte-1uso8"));
    			add_location(div5, file$6, 236, 8, 7054);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div2);
    			append_dev(div2, div0);
    			mount_component(titlebar, div0, null);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, button);
    			append_dev(button, span0);
    			append_dev(span0, i);
    			append_dev(button, t1);
    			append_dev(button, span1);
    			append_dev(div5, t3);
    			append_dev(div5, div4);
    			append_dev(div4, div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			insert_dev(target, t4, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*addpresenter*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$current_presenter, $presenters, view_presenter_info*/ 1104) {
    				each_value = /*$presenters*/ ctx[6];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div3, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*cssClasses*/ 4 && div5_class_value !== (div5_class_value = "" + (null_to_empty(/*cssClasses*/ ctx[2].join(' ')) + " svelte-1uso8"))) {
    				attr_dev(div5, "class", div5_class_value);
    			}

    			if (/*module_config*/ ctx[0].add_new_presenter) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*module_config*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_4$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(titlebar.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(titlebar.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_component(titlebar);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$3.name,
    		type: "if",
    		source: "(236:6) {#if !module_config.show_presenter_info}",
    		ctx
    	});

    	return block;
    }

    // (292:10) {:else}
    function create_else_block_2$3(ctx) {
    	let div2;
    	let div0;
    	let titlebar;
    	let t0;
    	let div1;
    	let button;
    	let span0;
    	let i;
    	let t1;
    	let span1;
    	let t3;
    	let t4;
    	let current_block_type_index;
    	let if_block1;
    	let if_block1_anchor;
    	let current;
    	let mounted;
    	let dispose;

    	titlebar = new Title({
    			props: {
    				message: /*module_config*/ ctx[0].progres_bar_message
    			},
    			$$inline: true
    		});

    	let if_block0 = /*module_config*/ ctx[0].show_add_session && create_if_block_7(ctx);
    	const if_block_creators = [create_if_block_6$1, create_else_block_3$1];
    	const if_blocks = [];

    	function select_block_type_4(ctx, dirty) {
    		if (/*$presenter_sessions*/ ctx[3].length > 0) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_4(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			create_component(titlebar.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			button = element("button");
    			span0 = element("span");
    			i = element("i");
    			t1 = space();
    			span1 = element("span");
    			span1.textContent = " Add a Session";
    			t3 = space();
    			if (if_block0) if_block0.c();
    			t4 = space();
    			if_block1.c();
    			if_block1_anchor = empty();
    			add_location(div0, file$6, 293, 14, 9086);
    			attr_dev(i, "class", "fas fa-plus-square");
    			add_location(i, file$6, 299, 20, 9324);
    			add_location(span0, file$6, 298, 18, 9297);
    			add_location(span1, file$6, 301, 18, 9401);
    			attr_dev(button, "class", "button is-primary");
    			add_location(button, file$6, 297, 16, 9222);
    			add_location(div1, file$6, 296, 14, 9200);
    			set_style(div2, "display", "flex");
    			set_style(div2, "justify-content", "space-between");
    			add_location(div2, file$6, 292, 12, 9013);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			mount_component(titlebar, div0, null);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, button);
    			append_dev(button, span0);
    			append_dev(span0, i);
    			append_dev(button, t1);
    			append_dev(button, span1);
    			insert_dev(target, t3, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*addsession*/ ctx[11], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const titlebar_changes = {};
    			if (dirty & /*module_config*/ 1) titlebar_changes.message = /*module_config*/ ctx[0].progres_bar_message;
    			titlebar.$set(titlebar_changes);

    			if (/*module_config*/ ctx[0].show_add_session) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*module_config*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_7(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t4.parentNode, t4);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_4(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks[current_block_type_index];

    				if (!if_block1) {
    					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block1.c();
    				} else {
    					if_block1.p(ctx, dirty);
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(titlebar.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(titlebar.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(titlebar);
    			if (detaching) detach_dev(t3);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t4);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2$3.name,
    		type: "else",
    		source: "(292:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (290:10) {#if module_config.is_presenter_sessions_loading}
    function create_if_block_5$1(ctx) {
    	let progressbar;
    	let current;

    	progressbar = new Progressbar({
    			props: {
    				module: /*module_config*/ ctx[0].progres_bar_message
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(progressbar.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(progressbar, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const progressbar_changes = {};
    			if (dirty & /*module_config*/ 1) progressbar_changes.module = /*module_config*/ ctx[0].progres_bar_message;
    			progressbar.$set(progressbar_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progressbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progressbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(progressbar, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(290:10) {#if module_config.is_presenter_sessions_loading}",
    		ctx
    	});

    	return block;
    }

    // (306:12) {#if module_config.show_add_session}
    function create_if_block_7(ctx) {
    	let addsessionview;
    	let current;

    	addsessionview = new Addsession({
    			props: {
    				add: hasKey(/*module_config*/ ctx[0].current_session, 'id')
    				? 'false'
    				: 'true',
    				edit: hasKey(/*module_config*/ ctx[0].current_session, 'id')
    				? 'true'
    				: 'false',
    				role: "admin",
    				currentpresenter: /*$current_presenter*/ ctx[4],
    				sessiondata: /*module_config*/ ctx[0].current_session
    			},
    			$$inline: true
    		});

    	addsessionview.$on("submitsession", /*handleAddSession*/ ctx[7]);
    	addsessionview.$on("closeaddsession", /*closeaddsession*/ ctx[13]);

    	const block = {
    		c: function create() {
    			create_component(addsessionview.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(addsessionview, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const addsessionview_changes = {};

    			if (dirty & /*module_config*/ 1) addsessionview_changes.add = hasKey(/*module_config*/ ctx[0].current_session, 'id')
    			? 'false'
    			: 'true';

    			if (dirty & /*module_config*/ 1) addsessionview_changes.edit = hasKey(/*module_config*/ ctx[0].current_session, 'id')
    			? 'true'
    			: 'false';

    			if (dirty & /*$current_presenter*/ 16) addsessionview_changes.currentpresenter = /*$current_presenter*/ ctx[4];
    			if (dirty & /*module_config*/ 1) addsessionview_changes.sessiondata = /*module_config*/ ctx[0].current_session;
    			addsessionview.$set(addsessionview_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(addsessionview.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(addsessionview.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(addsessionview, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(306:12) {#if module_config.show_add_session}",
    		ctx
    	});

    	return block;
    }

    // (329:12) {:else}
    function create_else_block_3$1(ctx) {
    	let div;
    	let titlebar;
    	let current;

    	titlebar = new Title({
    			props: {
    				message: "create sessions to spread the knowledge"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(titlebar.$$.fragment);
    			attr_dev(div, "class", "box");
    			add_location(div, file$6, 329, 14, 10623);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(titlebar, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(titlebar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(titlebar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(titlebar);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_3$1.name,
    		type: "else",
    		source: "(329:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (316:12) {#if $presenter_sessions.length > 0}
    function create_if_block_6$1(ctx) {
    	let div;
    	let current;
    	let each_value_1 = /*$presenter_sessions*/ ctx[3];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "box");
    			add_location(div, file$6, 316, 14, 10082);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$presenter_sessions, handleeditsession, handlecanelsession, handlestartsession, handlestopsession, handledeletesession*/ 1015816) {
    				each_value_1 = /*$presenter_sessions*/ ctx[3];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$1.name,
    		type: "if",
    		source: "(316:12) {#if $presenter_sessions.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (318:16) {#each $presenter_sessions as session}
    function create_each_block_1(ctx) {
    	let sessioncard;
    	let current;

    	sessioncard = new Sessioncard({
    			props: {
    				data: /*session*/ ctx[26],
    				role: "presenter"
    			},
    			$$inline: true
    		});

    	sessioncard.$on("editsession", /*handleeditsession*/ ctx[18]);
    	sessioncard.$on("canelsession", /*handlecanelsession*/ ctx[15]);
    	sessioncard.$on("startsession", /*handlestartsession*/ ctx[16]);
    	sessioncard.$on("stopsession", /*handlestopsession*/ ctx[17]);
    	sessioncard.$on("deletesession", /*handledeletesession*/ ctx[19]);

    	const block = {
    		c: function create() {
    			create_component(sessioncard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(sessioncard, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const sessioncard_changes = {};
    			if (dirty & /*$presenter_sessions*/ 8) sessioncard_changes.data = /*session*/ ctx[26];
    			sessioncard.$set(sessioncard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sessioncard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sessioncard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sessioncard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(318:16) {#each $presenter_sessions as session}",
    		ctx
    	});

    	return block;
    }

    // (255:14) {#each $presenters as presenter}
    function create_each_block$5(ctx) {
    	let presentercard;
    	let current;

    	function click_handler() {
    		return /*click_handler*/ ctx[21](/*presenter*/ ctx[23]);
    	}

    	presentercard = new Presentercard({
    			props: {
    				current: /*$current_presenter*/ ctx[4],
    				data: /*presenter*/ ctx[23]
    			},
    			$$inline: true
    		});

    	presentercard.$on("click", click_handler);

    	const block = {
    		c: function create() {
    			create_component(presentercard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(presentercard, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const presentercard_changes = {};
    			if (dirty & /*$current_presenter*/ 16) presentercard_changes.current = /*$current_presenter*/ ctx[4];
    			if (dirty & /*$presenters*/ 64) presentercard_changes.data = /*presenter*/ ctx[23];
    			presentercard.$set(presentercard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(presentercard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(presentercard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(presentercard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(255:14) {#each $presenters as presenter}",
    		ctx
    	});

    	return block;
    }

    // (264:8) {#if module_config.add_new_presenter}
    function create_if_block_4$1(ctx) {
    	let div;
    	let addpresenterview;
    	let div_class_value;
    	let current;

    	addpresenterview = new Addpresenter({
    			props: {
    				presenterdata: /*$current_presenter*/ ctx[4],
    				admin: "true",
    				add: "true",
    				close: "true",
    				edit: "false"
    			},
    			$$inline: true
    		});

    	addpresenterview.$on("closeAddPresenter", /*closeAddPresenter*/ ctx[12]);
    	addpresenterview.$on("submitpresenter", /*handleAddPresenter*/ ctx[8]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(addpresenterview.$$.fragment);
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*cssClasses*/ ctx[2].join(' ')) + " svelte-1uso8"));
    			add_location(div, file$6, 264, 10, 8033);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(addpresenterview, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const addpresenterview_changes = {};
    			if (dirty & /*$current_presenter*/ 16) addpresenterview_changes.presenterdata = /*$current_presenter*/ ctx[4];
    			addpresenterview.$set(addpresenterview_changes);

    			if (!current || dirty & /*cssClasses*/ 4 && div_class_value !== (div_class_value = "" + (null_to_empty(/*cssClasses*/ ctx[2].join(' ')) + " svelte-1uso8"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(addpresenterview.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(addpresenterview.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(addpresenterview);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(264:8) {#if module_config.add_new_presenter}",
    		ctx
    	});

    	return block;
    }

    // (339:4) {#if module_config.show_notification}
    function create_if_block_2$4(ctx) {
    	let notify;
    	let current;

    	notify = new Notify({
    			props: { config: /*notifyConfig*/ ctx[1] },
    			$$inline: true
    		});

    	notify.$on("closenotify", /*closenotify*/ ctx[20]);

    	const block = {
    		c: function create() {
    			create_component(notify.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(notify, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const notify_changes = {};
    			if (dirty & /*notifyConfig*/ 2) notify_changes.config = /*notifyConfig*/ ctx[1];
    			notify.$set(notify_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(notify.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(notify.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(notify, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(339:4) {#if module_config.show_notification}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$5, create_else_block_4$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$isAdmin*/ ctx[5]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let cssClasses;
    	let notifyConfig;
    	let $presenter_sessions;
    	let $current_presenter;
    	let $isAdmin;
    	let $token;
    	let $presenters;
    	validate_store(presenter_sessions, 'presenter_sessions');
    	component_subscribe($$self, presenter_sessions, $$value => $$invalidate(3, $presenter_sessions = $$value));
    	validate_store(current_presenter, 'current_presenter');
    	component_subscribe($$self, current_presenter, $$value => $$invalidate(4, $current_presenter = $$value));
    	validate_store(isAdmin, 'isAdmin');
    	component_subscribe($$self, isAdmin, $$value => $$invalidate(5, $isAdmin = $$value));
    	validate_store(token, 'token');
    	component_subscribe($$self, token, $$value => $$invalidate(22, $token = $$value));
    	validate_store(presenters, 'presenters');
    	component_subscribe($$self, presenters, $$value => $$invalidate(6, $presenters = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Admin', slots, []);

    	let module_config = {
    		is_presenter_sessions_loading: false,
    		is_loading: false,
    		show_presenter_info: false,
    		progres_bar_message: "",
    		current_session: {},
    		add_new_presenter: false,
    		show_add_session: false,
    		show_notification: false
    	};

    	onMount(async () => {
    		if ($isAdmin) {
    			$$invalidate(0, module_config.is_loading = true, module_config);
    			const url = `${apihost}/${appModules.presenter}`;
    			const headers = getAuthHeaders($token);
    			const result = await axios.get(url, headers);
    			set_store_value(presenters, $presenters = await result.data, $presenters);
    			$$invalidate(0, module_config.is_loading = false, module_config);
    		}
    	});

    	// the event is a dispatch event coming from component
    	const handleAddSession = async event => {
    		try {
    			const sessiondata = event.detail; // dispatch event data is avaible in event.detail
    			$$invalidate(1, notifyConfig = { cssClass: "is-info" });

    			if (sessiondata.isadd) {
    				const temp = [...$presenter_sessions, sessiondata];
    				set_store_value(presenter_sessions, $presenter_sessions = temp.map(data => getDateParts(data, "scheduledon")).sort((a, b) => new Date(b["scheduledon"]) - new Date(a["scheduledon"])), $presenter_sessions);
    				$$invalidate(1, notifyConfig["message"] = `${sessiondata.title} is added`, notifyConfig);
    			} else {
    				// update one item in the list
    				const filter = $presenter_sessions.filter(s => sessiondata.id !== s.id);

    				set_store_value(presenter_sessions, $presenter_sessions = [], $presenter_sessions);
    				set_store_value(presenter_sessions, $presenter_sessions = [...filter, sessiondata].map(data => getDateParts(data, "scheduledon")).sort((a, b) => new Date(b["scheduledon"]) - new Date(a["scheduledon"])), $presenter_sessions);
    				$$invalidate(1, notifyConfig["message"] = `${sessiondata.title} is updated`, notifyConfig);
    			}

    			$$invalidate(0, module_config.current_session = {}, module_config);
    			$$invalidate(0, module_config.show_add_session = false, module_config);
    			$$invalidate(0, module_config.show_notification = true, module_config);
    		} catch(error) {
    			console.log(error);
    		}
    	};

    	const handleAddPresenter = async event => {
    		try {
    			const presenter = event.detail; // dispatch event data is avaible in event.detail
    			const url = `${apihost}/${appModules.presenter}`;
    			presenter.status = 1;
    			const result = await axios.post(url, presenter, getAuthHeaders($token)).then(res => res.data);
    			set_store_value(presenters, $presenters = [...$presenters, result], $presenters);
    		} catch(error) {
    			console.log(error);
    		}
    	};

    	const addpresenter = async () => {
    		set_store_value(current_presenter, $current_presenter = {}, $current_presenter);
    		cssClasses.push("is-half");
    		$$invalidate(0, module_config.add_new_presenter = true, module_config);
    		$$invalidate(0, module_config.progres_bar_message = "Loading add presenter", module_config);
    	};

    	const view_presenter_info = async presenter => {
    		try {
    			set_store_value(current_presenter, $current_presenter = {}, $current_presenter);
    			set_store_value(current_presenter, $current_presenter = presenter, $current_presenter);
    			$$invalidate(0, module_config.show_add_session = false, module_config);
    			$$invalidate(0, module_config.show_presenter_info = true, module_config);
    			$$invalidate(0, module_config.is_presenter_sessions_loading = true, module_config);
    			$$invalidate(0, module_config.progres_bar_message = `${$current_presenter.displayName} sessions`, module_config);
    			const url = `${apihost}/${appModules.session}/createdby/${presenter.id}`;
    			const headers = getAuthHeaders($token);
    			const result = await axios.get(url, headers).then(res => res.data);
    			set_store_value(presenter_sessions, $presenter_sessions = result.map(data => getDateParts(data, "scheduledon")).sort((a, b) => new Date(b["scheduledon"]) - new Date(a["scheduledon"])), $presenter_sessions);
    			$$invalidate(0, module_config.is_presenter_sessions_loading = false, module_config);
    		} catch(error) {
    			console.log(error);
    		}
    	};

    	const addsession = () => {
    		$$invalidate(0, module_config.show_add_session = true, module_config);
    		$$invalidate(0, module_config.current_session = {}, module_config);
    	};

    	const closeAddPresenter = async () => {
    		try {
    			const close = event.detail;

    			if (close && $isAdmin) {
    				$$invalidate(0, module_config.add_new_presenter = false, module_config);
    				set_store_value(current_presenter, $current_presenter = {}, $current_presenter);
    			}
    		} catch(error) {
    			
    		}
    	};

    	const closeaddsession = async () => {
    		const close = event.detail;

    		if (close) {
    			$$invalidate(0, module_config.show_add_session = false, module_config);
    			$$invalidate(0, module_config.current_session = {}, module_config);
    		}
    	};

    	const goback = async () => {
    		$$invalidate(0, module_config.show_presenter_info = false, module_config);
    		set_store_value(current_presenter, $current_presenter = {}, $current_presenter);
    	};

    	const handlecanelsession = async event => {
    		const data = event.detail;

    		$$invalidate(1, notifyConfig = {
    			cssClass: "is-info",
    			message: `${data.title} is cancelled`
    		});

    		$$invalidate(0, module_config.show_notification = true, module_config);
    		console.log(data);
    	};

    	const handlestartsession = async event => {
    		const data = event.detail;

    		$$invalidate(1, notifyConfig = {
    			cssClass: "is-info",
    			message: `${data.title} is started`
    		});

    		$$invalidate(0, module_config.show_notification = true, module_config);
    		console.log(data);
    	};

    	const handlestopsession = async event => {
    		const data = event.detail;

    		notificyConfig = {
    			cssClass: "is-info",
    			message: `${data.title} is stopped`
    		};

    		$$invalidate(0, module_config.show_notification = true, module_config);
    		console.log(data);
    	};

    	const handleeditsession = event => {
    		$$invalidate(0, module_config.current_session = { ...event.detail }, module_config);

    		$$invalidate(1, notifyConfig = {
    			cssClass: "is-info",
    			message: `${module_config.current_session.title} is updated`
    		});

    		$$invalidate(0, module_config.show_notification = true, module_config);
    		$$invalidate(0, module_config.show_add_session = true, module_config);
    	};

    	const handledeletesession = event => {
    		const data = event.detail;
    		set_store_value(presenter_sessions, $presenter_sessions = $presenter_sessions.filter(s => s.id !== data.id), $presenter_sessions);

    		$$invalidate(1, notifyConfig = {
    			cssClass: "is-info",
    			message: `${data.title} is deleted`
    		});

    		$$invalidate(0, module_config.show_notification = true, module_config);
    	};

    	const closenotify = () => {
    		$$invalidate(0, module_config.show_notification = false, module_config);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<Admin> was created with unknown prop '${key}'`);
    	});

    	const click_handler = presenter => view_presenter_info(presenter);

    	$$self.$capture_state = () => ({
    		axios,
    		onMount,
    		apihost,
    		appModules,
    		getAuthHeaders,
    		getDateParts,
    		hasKey,
    		presenters,
    		presenter_sessions,
    		isAdmin,
    		token,
    		current_presenter,
    		TitleBar: Title,
    		ProgressBar: Progressbar,
    		SessionCard: Sessioncard,
    		PresenterCard: Presentercard,
    		AddPresenterView: Addpresenter,
    		AddSessionView: Addsession,
    		UnAuthorizedView: Unauthorized,
    		Meeting,
    		Notify,
    		module_config,
    		handleAddSession,
    		handleAddPresenter,
    		addpresenter,
    		view_presenter_info,
    		addsession,
    		closeAddPresenter,
    		closeaddsession,
    		goback,
    		handlecanelsession,
    		handlestartsession,
    		handlestopsession,
    		handleeditsession,
    		handledeletesession,
    		closenotify,
    		notifyConfig,
    		cssClasses,
    		$presenter_sessions,
    		$current_presenter,
    		$isAdmin,
    		$token,
    		$presenters
    	});

    	$$self.$inject_state = $$props => {
    		if ('module_config' in $$props) $$invalidate(0, module_config = $$props.module_config);
    		if ('notifyConfig' in $$props) $$invalidate(1, notifyConfig = $$props.notifyConfig);
    		if ('cssClasses' in $$props) $$invalidate(2, cssClasses = $$props.cssClasses);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(2, cssClasses = ["column"]);
    	$$invalidate(1, notifyConfig = {});

    	return [
    		module_config,
    		notifyConfig,
    		cssClasses,
    		$presenter_sessions,
    		$current_presenter,
    		$isAdmin,
    		$presenters,
    		handleAddSession,
    		handleAddPresenter,
    		addpresenter,
    		view_presenter_info,
    		addsession,
    		closeAddPresenter,
    		closeaddsession,
    		goback,
    		handlecanelsession,
    		handlestartsession,
    		handlestopsession,
    		handleeditsession,
    		handledeletesession,
    		closenotify,
    		click_handler
    	];
    }

    class Admin extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Admin",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/pages/components/modal.svelte generated by Svelte v3.40.1 */

    const file$5 = "src/pages/components/modal.svelte";

    function create_fragment$6(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let div1;
    	let header;
    	let p;
    	let t2;
    	let button0;
    	let t3;
    	let section;
    	let t4;
    	let t5;
    	let footer;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			header = element("header");
    			p = element("p");
    			p.textContent = "Information";
    			t2 = space();
    			button0 = element("button");
    			t3 = space();
    			section = element("section");
    			t4 = text(/*message*/ ctx[0]);
    			t5 = space();
    			footer = element("footer");
    			button1 = element("button");
    			button1.textContent = "Close";
    			attr_dev(div0, "class", "modal-background");
    			add_location(div0, file$5, 5, 2, 101);
    			attr_dev(p, "class", "modal-card-title");
    			add_location(p, file$5, 8, 6, 204);
    			attr_dev(button0, "class", "delete");
    			attr_dev(button0, "aria-label", "close");
    			add_location(button0, file$5, 9, 6, 254);
    			attr_dev(header, "class", "modal-card-head");
    			add_location(header, file$5, 7, 4, 165);
    			attr_dev(section, "class", "modal-card-body");
    			add_location(section, file$5, 11, 4, 326);
    			attr_dev(button1, "class", "button");
    			add_location(button1, file$5, 13, 6, 422);
    			attr_dev(footer, "class", "modal-card-foot");
    			add_location(footer, file$5, 12, 4, 383);
    			attr_dev(div1, "class", "modal-card");
    			add_location(div1, file$5, 6, 2, 136);
    			attr_dev(div2, "class", "modal is-active");
    			add_location(div2, file$5, 4, 0, 69);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, header);
    			append_dev(header, p);
    			append_dev(header, t2);
    			append_dev(header, button0);
    			append_dev(div1, t3);
    			append_dev(div1, section);
    			append_dev(section, t4);
    			append_dev(div1, t5);
    			append_dev(div1, footer);
    			append_dev(footer, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[2], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*message*/ 1) set_data_dev(t4, /*message*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Modal', slots, []);
    	let { message = "Please login to enroll" } = $$props;
    	const writable_props = ['message'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	function click_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('message' in $$props) $$invalidate(0, message = $$props.message);
    	};

    	$$self.$capture_state = () => ({ message });

    	$$self.$inject_state = $$props => {
    		if ('message' in $$props) $$invalidate(0, message = $$props.message);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [message, click_handler_1, click_handler];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$6, create_fragment$6, safe_not_equal, { message: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get message() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set message(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/components/presenterview.svelte generated by Svelte v3.40.1 */
    const file$4 = "src/pages/components/presenterview.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (53:0) {:else}
    function create_else_block_2$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "You are authorized to view the content";
    			attr_dev(div, "class", "is-danger");
    			add_location(div, file$4, 53, 2, 1617);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2$2.name,
    		type: "else",
    		source: "(53:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (24:0) {#if isAdmin}
    function create_if_block$4(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$4, create_else_block$4];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*isLoading*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(24:0) {#if isAdmin}",
    		ctx
    	});

    	return block;
    }

    // (29:2) {:else}
    function create_else_block$4(ctx) {
    	let titlebar;
    	let t0;
    	let div2;
    	let div1;
    	let div0;
    	let presenterdataview;
    	let t1;
    	let current;

    	titlebar = new Title({
    			props: { message: "Loading persenter information" },
    			$$inline: true
    		});

    	presenterdataview = new Addpresenter({ $$inline: true });
    	let if_block = /*show_presenter_sessions*/ ctx[4] && create_if_block_2$3(ctx);

    	const block = {
    		c: function create() {
    			create_component(titlebar.$$.fragment);
    			t0 = space();
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			create_component(presenterdataview.$$.fragment);
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "grid-container");
    			add_location(div0, file$4, 32, 8, 1029);
    			attr_dev(div1, "class", /*cssClasses*/ ctx[3].join(' '));
    			add_location(div1, file$4, 31, 6, 986);
    			attr_dev(div2, "class", "columns");
    			set_style(div2, "padding-left", "2rem");
    			set_style(div2, "padding-right", "2rem");
    			add_location(div2, file$4, 30, 4, 910);
    		},
    		m: function mount(target, anchor) {
    			mount_component(titlebar, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			mount_component(presenterdataview, div0, null);
    			append_dev(div2, t1);
    			if (if_block) if_block.m(div2, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*show_presenter_sessions*/ ctx[4]) if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(titlebar.$$.fragment, local);
    			transition_in(presenterdataview.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(titlebar.$$.fragment, local);
    			transition_out(presenterdataview.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(titlebar, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			destroy_component(presenterdataview);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(29:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (25:2) {#if isLoading}
    function create_if_block_1$4(ctx) {
    	let div;
    	let progressbar;
    	let current;

    	progressbar = new Progressbar({
    			props: { module: "presenters" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(progressbar.$$.fragment);
    			attr_dev(div, "class", "container");
    			add_location(div, file$4, 25, 4, 762);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(progressbar, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progressbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progressbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(progressbar);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(25:2) {#if isLoading}",
    		ctx
    	});

    	return block;
    }

    // (37:6) {#if show_presenter_sessions}
    function create_if_block_2$3(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block_3$2, create_else_block_1$2];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*is_presenter_sessions_loading*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", /*cssClasses*/ ctx[3].join(' '));
    			add_location(div, file$4, 37, 8, 1162);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(37:6) {#if show_presenter_sessions}",
    		ctx
    	});

    	return block;
    }

    // (41:10) {:else}
    function create_else_block_1$2(ctx) {
    	let div;
    	let titlebar;
    	let t;
    	let each_1_anchor;
    	let current;

    	titlebar = new Title({
    			props: { message: /*progres_bar_message*/ ctx[5] },
    			$$inline: true
    		});

    	let each_value = /*$presenter_sessions*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(titlebar.$$.fragment);
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			add_location(div, file$4, 41, 12, 1330);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(titlebar, div, null);
    			insert_dev(target, t, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$presenter_sessions*/ 1) {
    				each_value = /*$presenter_sessions*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(titlebar.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(titlebar.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(titlebar);
    			if (detaching) detach_dev(t);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$2.name,
    		type: "else",
    		source: "(41:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (39:10) {#if is_presenter_sessions_loading}
    function create_if_block_3$2(ctx) {
    	let progressbar;
    	let current;

    	progressbar = new Progressbar({
    			props: { module: /*progres_bar_message*/ ctx[5] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(progressbar.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(progressbar, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progressbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progressbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(progressbar, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(39:10) {#if is_presenter_sessions_loading}",
    		ctx
    	});

    	return block;
    }

    // (45:12) {#each $presenter_sessions as session}
    function create_each_block$4(ctx) {
    	let sessionview;
    	let current;

    	sessionview = new Sessioncard({
    			props: {
    				data: /*session*/ ctx[8],
    				role: "presenter"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(sessionview.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(sessionview, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const sessionview_changes = {};
    			if (dirty & /*$presenter_sessions*/ 1) sessionview_changes.data = /*session*/ ctx[8];
    			sessionview.$set(sessionview_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sessionview.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sessionview.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sessionview, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(45:12) {#each $presenter_sessions as session}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$4, create_else_block_2$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (isAdmin) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type();
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $presenter_sessions;
    	validate_store(presenter_sessions, 'presenter_sessions');
    	component_subscribe($$self, presenter_sessions, $$value => $$invalidate(0, $presenter_sessions = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Presenterview', slots, []);
    	let is_presenter_sessions_loading = false;
    	let isLoading = false;
    	let current_presenter = {};
    	let cssClasses = ["column"];
    	let show_presenter_sessions = false;
    	let show_add_presenter = false;
    	let progres_bar_message = "";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Presenterview> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		PresenterDataView: Addpresenter,
    		SessionView: Sessioncard,
    		axios,
    		onMount,
    		apihost,
    		appModules,
    		getAuthHeaders,
    		getDateParts,
    		presenters,
    		presenter_sessions,
    		isAdmin,
    		token,
    		TitleBar: Title,
    		ProgressBar: Progressbar,
    		is_presenter_sessions_loading,
    		isLoading,
    		current_presenter,
    		cssClasses,
    		show_presenter_sessions,
    		show_add_presenter,
    		progres_bar_message,
    		$presenter_sessions
    	});

    	$$self.$inject_state = $$props => {
    		if ('is_presenter_sessions_loading' in $$props) $$invalidate(1, is_presenter_sessions_loading = $$props.is_presenter_sessions_loading);
    		if ('isLoading' in $$props) $$invalidate(2, isLoading = $$props.isLoading);
    		if ('current_presenter' in $$props) current_presenter = $$props.current_presenter;
    		if ('cssClasses' in $$props) $$invalidate(3, cssClasses = $$props.cssClasses);
    		if ('show_presenter_sessions' in $$props) $$invalidate(4, show_presenter_sessions = $$props.show_presenter_sessions);
    		if ('show_add_presenter' in $$props) show_add_presenter = $$props.show_add_presenter;
    		if ('progres_bar_message' in $$props) $$invalidate(5, progres_bar_message = $$props.progres_bar_message);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		$presenter_sessions,
    		is_presenter_sessions_loading,
    		isLoading,
    		cssClasses,
    		show_presenter_sessions,
    		progres_bar_message
    	];
    }

    class Presenterview extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Presenterview",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/pages/index.svelte generated by Svelte v3.40.1 */
    const file$3 = "src/pages/index.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (48:2) {:else}
    function create_else_block$3(ctx) {
    	let titlebar;
    	let t;
    	let each_1_anchor;
    	let current;

    	titlebar = new Title({
    			props: { message: "Current Sessions in māhita" },
    			$$inline: true
    		});

    	let each_value = /*$sessions*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			create_component(titlebar.$$.fragment);
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			mount_component(titlebar, target, anchor);
    			insert_dev(target, t, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$sessions, handleShowModal, enroll*/ 28) {
    				each_value = /*$sessions*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(titlebar.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(titlebar.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(titlebar, detaching);
    			if (detaching) detach_dev(t);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(48:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (46:2) {#if isLoading}
    function create_if_block_1$3(ctx) {
    	let progressbar;
    	let current;

    	progressbar = new Progressbar({
    			props: { module: "session" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(progressbar.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(progressbar, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progressbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progressbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(progressbar, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(46:2) {#if isLoading}",
    		ctx
    	});

    	return block;
    }

    // (50:4) {#each $sessions as session}
    function create_each_block$3(ctx) {
    	let sessioncard;
    	let current;

    	sessioncard = new Sessioncard({
    			props: { role: "user", data: /*session*/ ctx[7] },
    			$$inline: true
    		});

    	sessioncard.$on("handleShowModal", /*handleShowModal*/ ctx[4]);
    	sessioncard.$on("click", /*enroll*/ ctx[3]);

    	const block = {
    		c: function create() {
    			create_component(sessioncard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(sessioncard, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const sessioncard_changes = {};
    			if (dirty & /*$sessions*/ 4) sessioncard_changes.data = /*session*/ ctx[7];
    			sessioncard.$set(sessioncard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sessioncard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sessioncard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sessioncard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(50:4) {#each $sessions as session}",
    		ctx
    	});

    	return block;
    }

    // (58:2) {#if showModal}
    function create_if_block$3(ctx) {
    	let modal;
    	let current;

    	modal = new Modal({
    			props: {
    				message: "Please login to the system to enroll"
    			},
    			$$inline: true
    		});

    	modal.$on("click", /*modalClose*/ ctx[5]);

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(58:2) {#if showModal}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block0;
    	let t;
    	let current;
    	const if_block_creators = [create_if_block_1$3, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*isLoading*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = /*showModal*/ ctx[0] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div, "class", "container svelte-ta8tmd");
    			add_location(div, file$3, 44, 0, 1182);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			append_dev(div, t);
    			if (if_block1) if_block1.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(div, t);
    			}

    			if (/*showModal*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*showModal*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $appuser;
    	let $sessions;
    	validate_store(appuser, 'appuser');
    	component_subscribe($$self, appuser, $$value => $$invalidate(6, $appuser = $$value));
    	validate_store(sessions, 'sessions');
    	component_subscribe($$self, sessions, $$value => $$invalidate(2, $sessions = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Pages', slots, []);
    	appuser.useLocalStorage(); // enable local storage
    	let showModal = false;
    	let isLoading = false;

    	onMount(async () => {
    		$$invalidate(1, isLoading = true);
    		const url = apihost + "/" + appModules.session + "/public";
    		const result = await axios.get(url).then(res => res.data);
    		set_store_value(sessions, $sessions = result.map(data => getDateParts(data, "scheduledon")).sort((a, b) => new Date(b["scheduledon"]) - new Date(a["scheduledon"])), $sessions);
    		$$invalidate(1, isLoading = false);
    	});

    	const enroll = () => {
    		if (!$appuser.isLoggedIn) {
    			$$invalidate(0, showModal = true);
    		}
    	};

    	const handleShowModal = () => {
    		$$invalidate(0, showModal = true);
    	};

    	const modalClose = () => $$invalidate(0, showModal = false);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Pages> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		axios,
    		TitleBar: Title,
    		ProgressBar: Progressbar,
    		Modal,
    		SessionCard: Sessioncard,
    		apihost,
    		appModules,
    		getDateParts,
    		appuser,
    		sessions,
    		showModal,
    		isLoading,
    		enroll,
    		handleShowModal,
    		modalClose,
    		$appuser,
    		$sessions
    	});

    	$$self.$inject_state = $$props => {
    		if ('showModal' in $$props) $$invalidate(0, showModal = $$props.showModal);
    		if ('isLoading' in $$props) $$invalidate(1, isLoading = $$props.isLoading);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [showModal, isLoading, $sessions, enroll, handleShowModal, modalClose];
    }

    class Pages extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Pages",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/pages/presenter/index.svelte generated by Svelte v3.40.1 */

    const { console: console_1$1 } = globals;
    const file$2 = "src/pages/presenter/index.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    // (226:0) {:else}
    function create_else_block_4(ctx) {
    	let div;
    	let unauthorizedview;
    	let current;

    	unauthorizedview = new Unauthorized({
    			props: {
    				message: "You are not authorized to view the content"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(unauthorizedview.$$.fragment);
    			add_location(div, file$2, 226, 2, 7093);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(unauthorizedview, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(unauthorizedview.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(unauthorizedview.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(unauthorizedview);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_4.name,
    		type: "else",
    		source: "(226:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (144:0) {#if $isPresenter}
    function create_if_block$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$2, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*module_config*/ ctx[0].isLoading) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(144:0) {#if $isPresenter}",
    		ctx
    	});

    	return block;
    }

    // (149:2) {:else}
    function create_else_block$2(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block0;
    	let t0;
    	let meeting;
    	let t1;
    	let if_block1_anchor;
    	let current;
    	const if_block_creators = [create_if_block_3$1, create_else_block_1$1];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (!/*module_config*/ ctx[0].show_presenter_info) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	meeting = new Meeting({ $$inline: true });
    	let if_block1 = /*module_config*/ ctx[0].show_notification && create_if_block_2$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block0.c();
    			t0 = space();
    			create_component(meeting.$$.fragment);
    			t1 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(div, "class", "columns");
    			set_style(div, "padding-left", "2rem");
    			set_style(div, "padding-right", "2rem");
    			set_style(div, "padding-top", "2rem");
    			add_location(div, file$2, 149, 4, 4236);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			insert_dev(target, t0, anchor);
    			mount_component(meeting, target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(div, null);
    			}

    			if (/*module_config*/ ctx[0].show_notification) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*module_config*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_2$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(meeting.$$.fragment, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(meeting.$$.fragment, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    			if (detaching) detach_dev(t0);
    			destroy_component(meeting, detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(149:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (145:2) {#if module_config.isLoading}
    function create_if_block_1$2(ctx) {
    	let div;
    	let progressbar;
    	let current;

    	progressbar = new Progressbar({
    			props: { module: "loading presenter data" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(progressbar.$$.fragment);
    			attr_dev(div, "class", "container svelte-1uso8");
    			add_location(div, file$2, 145, 4, 4133);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(progressbar, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progressbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progressbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(progressbar);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(145:2) {#if module_config.isLoading}",
    		ctx
    	});

    	return block;
    }

    // (163:6) {:else}
    function create_else_block_1$1(ctx) {
    	let div0;
    	let addpresenterview;
    	let t;
    	let div1;
    	let current_block_type_index;
    	let if_block;
    	let current;

    	addpresenterview = new Addpresenter({
    			props: {
    				presenterdata: /*$current_presenter*/ ctx[4],
    				admin: "false",
    				add: "false",
    				close: "false",
    				edit: "true"
    			},
    			$$inline: true
    		});

    	addpresenterview.$on("submitpresenter", /*handleAddPresenter*/ ctx[6]);
    	const if_block_creators = [create_if_block_4, create_else_block_2$1];
    	const if_blocks = [];

    	function select_block_type_3(ctx, dirty) {
    		if (/*module_config*/ ctx[0].is_presenter_sessions_loading) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_3(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(addpresenterview.$$.fragment);
    			t = space();
    			div1 = element("div");
    			if_block.c();
    			attr_dev(div0, "class", "column is-half");
    			add_location(div0, file$2, 163, 8, 4695);
    			attr_dev(div1, "class", "column is-half");
    			add_location(div1, file$2, 172, 8, 4977);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(addpresenterview, div0, null);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			if_blocks[current_block_type_index].m(div1, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const addpresenterview_changes = {};
    			if (dirty & /*$current_presenter*/ 16) addpresenterview_changes.presenterdata = /*$current_presenter*/ ctx[4];
    			addpresenterview.$set(addpresenterview_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_3(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div1, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(addpresenterview.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(addpresenterview.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(addpresenterview);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(163:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (153:6) {#if !module_config.show_presenter_info}
    function create_if_block_3$1(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let titlebar;
    	let div2_class_value;
    	let current;

    	titlebar = new Title({
    			props: { message: "Active presenters in maahita" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			create_component(titlebar.$$.fragment);
    			add_location(div0, file$2, 157, 12, 4550);
    			set_style(div1, "display", "flex");
    			set_style(div1, "justify-content", "space-evenly");
    			set_style(div1, "align-items", "center");
    			add_location(div1, file$2, 154, 10, 4435);
    			attr_dev(div2, "class", div2_class_value = "" + (null_to_empty(/*cssClasses*/ ctx[2].join(' ')) + " svelte-1uso8"));
    			add_location(div2, file$2, 153, 8, 4390);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			mount_component(titlebar, div0, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*cssClasses*/ 4 && div2_class_value !== (div2_class_value = "" + (null_to_empty(/*cssClasses*/ ctx[2].join(' ')) + " svelte-1uso8"))) {
    				attr_dev(div2, "class", div2_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(titlebar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(titlebar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(titlebar);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(153:6) {#if !module_config.show_presenter_info}",
    		ctx
    	});

    	return block;
    }

    // (176:10) {:else}
    function create_else_block_2$1(ctx) {
    	let div2;
    	let div0;
    	let titlebar;
    	let t0;
    	let div1;
    	let button;
    	let span0;
    	let i;
    	let t1;
    	let span1;
    	let t3;
    	let t4;
    	let current_block_type_index;
    	let if_block1;
    	let if_block1_anchor;
    	let current;
    	let mounted;
    	let dispose;

    	titlebar = new Title({
    			props: {
    				message: /*module_config*/ ctx[0].progres_bar_message
    			},
    			$$inline: true
    		});

    	let if_block0 = /*module_config*/ ctx[0].show_add_session && create_if_block_6(ctx);
    	const if_block_creators = [create_if_block_5, create_else_block_3];
    	const if_blocks = [];

    	function select_block_type_4(ctx, dirty) {
    		if (/*$presenter_sessions*/ ctx[3].length > 0) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_4(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			create_component(titlebar.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			button = element("button");
    			span0 = element("span");
    			i = element("i");
    			t1 = space();
    			span1 = element("span");
    			span1.textContent = " Request a Session";
    			t3 = space();
    			if (if_block0) if_block0.c();
    			t4 = space();
    			if_block1.c();
    			if_block1_anchor = empty();
    			add_location(div0, file$2, 177, 14, 5240);
    			attr_dev(i, "class", "far fa-plus-square");
    			add_location(i, file$2, 183, 20, 5478);
    			add_location(span0, file$2, 182, 18, 5451);
    			add_location(span1, file$2, 185, 18, 5555);
    			attr_dev(button, "class", "button is-primary");
    			add_location(button, file$2, 181, 16, 5376);
    			add_location(div1, file$2, 180, 14, 5354);
    			set_style(div2, "display", "flex");
    			set_style(div2, "justify-content", "space-between");
    			add_location(div2, file$2, 176, 12, 5167);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			mount_component(titlebar, div0, null);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, button);
    			append_dev(button, span0);
    			append_dev(span0, i);
    			append_dev(button, t1);
    			append_dev(button, span1);
    			insert_dev(target, t3, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*addrequest*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const titlebar_changes = {};
    			if (dirty & /*module_config*/ 1) titlebar_changes.message = /*module_config*/ ctx[0].progres_bar_message;
    			titlebar.$set(titlebar_changes);

    			if (/*module_config*/ ctx[0].show_add_session) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*module_config*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_6(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t4.parentNode, t4);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_4(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks[current_block_type_index];

    				if (!if_block1) {
    					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block1.c();
    				} else {
    					if_block1.p(ctx, dirty);
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(titlebar.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(titlebar.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(titlebar);
    			if (detaching) detach_dev(t3);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t4);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2$1.name,
    		type: "else",
    		source: "(176:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (174:10) {#if module_config.is_presenter_sessions_loading}
    function create_if_block_4(ctx) {
    	let progressbar;
    	let current;

    	progressbar = new Progressbar({
    			props: {
    				module: /*module_config*/ ctx[0].progres_bar_message
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(progressbar.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(progressbar, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const progressbar_changes = {};
    			if (dirty & /*module_config*/ 1) progressbar_changes.module = /*module_config*/ ctx[0].progres_bar_message;
    			progressbar.$set(progressbar_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progressbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progressbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(progressbar, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(174:10) {#if module_config.is_presenter_sessions_loading}",
    		ctx
    	});

    	return block;
    }

    // (190:12) {#if module_config.show_add_session}
    function create_if_block_6(ctx) {
    	let addsessionview;
    	let current;

    	addsessionview = new Addsession({
    			props: {
    				add: hasKey(/*module_config*/ ctx[0].current_session, 'id')
    				? 'false'
    				: 'true',
    				edit: hasKey(/*module_config*/ ctx[0].current_session, 'id')
    				? 'true'
    				: 'false',
    				currentpresenter: /*$current_presenter*/ ctx[4],
    				sessiondata: /*module_config*/ ctx[0].current_session
    			},
    			$$inline: true
    		});

    	addsessionview.$on("closeaddsession", /*closeaddsession*/ ctx[8]);
    	addsessionview.$on("submitrequest", /*submitrequest*/ ctx[14]);

    	const block = {
    		c: function create() {
    			create_component(addsessionview.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(addsessionview, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const addsessionview_changes = {};

    			if (dirty & /*module_config*/ 1) addsessionview_changes.add = hasKey(/*module_config*/ ctx[0].current_session, 'id')
    			? 'false'
    			: 'true';

    			if (dirty & /*module_config*/ 1) addsessionview_changes.edit = hasKey(/*module_config*/ ctx[0].current_session, 'id')
    			? 'true'
    			: 'false';

    			if (dirty & /*$current_presenter*/ 16) addsessionview_changes.currentpresenter = /*$current_presenter*/ ctx[4];
    			if (dirty & /*module_config*/ 1) addsessionview_changes.sessiondata = /*module_config*/ ctx[0].current_session;
    			addsessionview.$set(addsessionview_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(addsessionview.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(addsessionview.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(addsessionview, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(190:12) {#if module_config.show_add_session}",
    		ctx
    	});

    	return block;
    }

    // (212:12) {:else}
    function create_else_block_3(ctx) {
    	let div;
    	let titlebar;
    	let current;

    	titlebar = new Title({
    			props: {
    				message: "create sessions to spread the knowledge"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(titlebar.$$.fragment);
    			attr_dev(div, "class", "box");
    			add_location(div, file$2, 212, 14, 6749);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(titlebar, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(titlebar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(titlebar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(titlebar);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_3.name,
    		type: "else",
    		source: "(212:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (199:12) {#if $presenter_sessions.length > 0}
    function create_if_block_5(ctx) {
    	let div;
    	let current;
    	let each_value = /*$presenter_sessions*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "box");
    			add_location(div, file$2, 199, 14, 6208);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$presenter_sessions, handleeditsession, handlecanelsession, handlestartsession, handlestopsession, handledeletesession*/ 15880) {
    				each_value = /*$presenter_sessions*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(199:12) {#if $presenter_sessions.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (201:16) {#each $presenter_sessions as session}
    function create_each_block$2(ctx) {
    	let sessioncard;
    	let current;

    	sessioncard = new Sessioncard({
    			props: {
    				data: /*session*/ ctx[19],
    				role: "presenter"
    			},
    			$$inline: true
    		});

    	sessioncard.$on("editsession", /*handleeditsession*/ ctx[12]);
    	sessioncard.$on("canelsession", /*handlecanelsession*/ ctx[9]);
    	sessioncard.$on("startsession", /*handlestartsession*/ ctx[10]);
    	sessioncard.$on("stopsession", /*handlestopsession*/ ctx[11]);
    	sessioncard.$on("deletesession", /*handledeletesession*/ ctx[13]);

    	const block = {
    		c: function create() {
    			create_component(sessioncard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(sessioncard, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const sessioncard_changes = {};
    			if (dirty & /*$presenter_sessions*/ 8) sessioncard_changes.data = /*session*/ ctx[19];
    			sessioncard.$set(sessioncard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sessioncard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sessioncard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sessioncard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(201:16) {#each $presenter_sessions as session}",
    		ctx
    	});

    	return block;
    }

    // (222:4) {#if module_config.show_notification}
    function create_if_block_2$2(ctx) {
    	let notify;
    	let current;

    	notify = new Notify({
    			props: { config: /*notifyConfig*/ ctx[1] },
    			$$inline: true
    		});

    	notify.$on("closenotify", /*closenotify*/ ctx[15]);

    	const block = {
    		c: function create() {
    			create_component(notify.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(notify, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const notify_changes = {};
    			if (dirty & /*notifyConfig*/ 2) notify_changes.config = /*notifyConfig*/ ctx[1];
    			notify.$set(notify_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(notify.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(notify.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(notify, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(222:4) {#if module_config.show_notification}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block_4];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$isPresenter*/ ctx[5]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let cssClasses;
    	let notifyConfig;
    	let $presenter_sessions;
    	let $token;
    	let $loggedInUserId;
    	let $current_presenter;
    	let $isPresenter;
    	validate_store(presenter_sessions, 'presenter_sessions');
    	component_subscribe($$self, presenter_sessions, $$value => $$invalidate(3, $presenter_sessions = $$value));
    	validate_store(token, 'token');
    	component_subscribe($$self, token, $$value => $$invalidate(16, $token = $$value));
    	validate_store(loggedInUserId, 'loggedInUserId');
    	component_subscribe($$self, loggedInUserId, $$value => $$invalidate(17, $loggedInUserId = $$value));
    	validate_store(current_presenter, 'current_presenter');
    	component_subscribe($$self, current_presenter, $$value => $$invalidate(4, $current_presenter = $$value));
    	validate_store(isPresenter, 'isPresenter');
    	component_subscribe($$self, isPresenter, $$value => $$invalidate(5, $isPresenter = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Presenter', slots, []);

    	let module_config = {
    		is_presenter_sessions_loading: false,
    		isLoading: false,
    		show_presenter_info: false,
    		progres_bar_message: "",
    		current_session: {},
    		show_add_session: false,
    		show_notification: false
    	};

    	onMount(async () => {
    		$$invalidate(0, module_config.isLoading = true, module_config);
    		const uid = $loggedInUserId;
    		const url = `${apihost}/${appModules.presenter}/${uid}`;
    		const headers = getAuthHeaders($token);
    		set_store_value(current_presenter, $current_presenter = await axios.get(url, headers).then(res => res.data), $current_presenter);
    		$$invalidate(0, module_config.isLoading = false, module_config);
    		$$invalidate(0, module_config.show_presenter_info = true, module_config);
    		load_presenter_sessions();
    	});

    	const load_presenter_sessions = async () => {
    		$$invalidate(0, module_config.is_presenter_sessions_loading = true, module_config);
    		const uid = $loggedInUserId;
    		const url = `${apihost}/${appModules.session}/createdby/${uid}`;
    		const headers = getAuthHeaders($token);
    		const result = await axios.get(url, headers).then(res => res.data);
    		set_store_value(presenter_sessions, $presenter_sessions = result.map(data => getDateParts(data, "scheduledon")).sort((a, b) => new Date(b["scheduledon"]) - new Date(a["scheduledon"])), $presenter_sessions);
    		$$invalidate(0, module_config.is_presenter_sessions_loading = false, module_config);
    	};

    	// the event is a dispatch event coming from component
    	const handleAddPresenter = async event => {
    		try {
    			const presenter = event.detail; // dispatch event data is avaible in event.detail
    			const url = `${apihost}/${appModules.presenter}`;
    			presenter.status = 1;
    			const result = await axios.post(url, presenter, getAuthHeaders($token)).then(res => res.data);
    		} catch(error) {
    			console.log(error);
    		}
    	};

    	const addrequest = () => {
    		$$invalidate(0, module_config.show_add_session = true, module_config);
    	};

    	const closeaddsession = async () => {
    		const close = event.detail;

    		if (close) {
    			$$invalidate(0, module_config.show_add_session = false, module_config);
    			$$invalidate(0, module_config.current_session = {}, module_config);
    		}
    	};

    	const handlecanelsession = async event => {
    		const data = event.detail;
    		console.log(data);
    	};

    	const handlestartsession = async event => {
    		const data = event.detail;
    		console.log(data);
    	};

    	const handlestopsession = async event => {
    		const data = event.detail;
    		console.log(data);
    	};

    	const handleeditsession = event => {
    		$$invalidate(0, module_config.current_session = { ...event.detail }, module_config);
    		$$invalidate(0, module_config.show_add_session = true, module_config);
    	};

    	const handledeletesession = event => {
    		const session = event.detail;
    		set_store_value(presenter_sessions, $presenter_sessions = $presenter_sessions.filter(s => s.id !== session.id), $presenter_sessions);
    	};

    	const submitrequest = event => {
    		const data = event.detail;

    		$$invalidate(1, notifyConfig = {
    			...notifyConfig,
    			message: `Request submitted for ${data.title}`
    		});

    		$$invalidate(0, module_config.show_add_session = false, module_config);
    		$$invalidate(0, module_config.show_notification = true, module_config);
    	};

    	const closenotify = () => {
    		$$invalidate(0, module_config.show_notification = false, module_config);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Presenter> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		axios,
    		onMount,
    		apihost,
    		appModules,
    		getAuthHeaders,
    		hasKey,
    		getDateParts,
    		loggedInUserId,
    		presenter_sessions,
    		token,
    		current_presenter,
    		isPresenter,
    		TitleBar: Title,
    		ProgressBar: Progressbar,
    		SessionCard: Sessioncard,
    		AddPresenterView: Addpresenter,
    		AddSessionView: Addsession,
    		UnAuthorizedView: Unauthorized,
    		Meeting,
    		Notify,
    		module_config,
    		load_presenter_sessions,
    		handleAddPresenter,
    		addrequest,
    		closeaddsession,
    		handlecanelsession,
    		handlestartsession,
    		handlestopsession,
    		handleeditsession,
    		handledeletesession,
    		submitrequest,
    		closenotify,
    		notifyConfig,
    		cssClasses,
    		$presenter_sessions,
    		$token,
    		$loggedInUserId,
    		$current_presenter,
    		$isPresenter
    	});

    	$$self.$inject_state = $$props => {
    		if ('module_config' in $$props) $$invalidate(0, module_config = $$props.module_config);
    		if ('notifyConfig' in $$props) $$invalidate(1, notifyConfig = $$props.notifyConfig);
    		if ('cssClasses' in $$props) $$invalidate(2, cssClasses = $$props.cssClasses);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(2, cssClasses = ["column"]);
    	$$invalidate(1, notifyConfig = { cssClass: "is-info" });

    	return [
    		module_config,
    		notifyConfig,
    		cssClasses,
    		$presenter_sessions,
    		$current_presenter,
    		$isPresenter,
    		handleAddPresenter,
    		addrequest,
    		closeaddsession,
    		handlecanelsession,
    		handlestartsession,
    		handlestopsession,
    		handleeditsession,
    		handledeletesession,
    		submitrequest,
    		closenotify
    	];
    }

    class Presenter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Presenter",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/pages/sessionrequest/index.svelte generated by Svelte v3.40.1 */

    const { console: console_1 } = globals;
    const file$1 = "src/pages/sessionrequest/index.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (140:2) {:else}
    function create_else_block_2(ctx) {
    	let div;
    	let unauthorizedview;
    	let current;

    	unauthorizedview = new Unauthorized({
    			props: {
    				message: "You are not authorized to view the content"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(unauthorizedview.$$.fragment);
    			add_location(div, file$1, 140, 4, 4096);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(unauthorizedview, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(unauthorizedview.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(unauthorizedview.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(unauthorizedview);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(140:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (106:2) {#if $isAdmin}
    function create_if_block_1$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*module_config*/ ctx[0].is_loading) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(106:2) {#if $isAdmin}",
    		ctx
    	});

    	return block;
    }

    // (109:4) {:else}
    function create_else_block$1(ctx) {
    	let titlebar;
    	let t;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;

    	titlebar = new Title({
    			props: {
    				message: "Session requests by various presenters"
    			},
    			$$inline: true
    		});

    	const if_block_creators = [create_if_block_3, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*$sessionrequests*/ ctx[2].length > 0) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			create_component(titlebar.$$.fragment);
    			t = space();
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			mount_component(titlebar, target, anchor);
    			insert_dev(target, t, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(titlebar.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(titlebar.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(titlebar, detaching);
    			if (detaching) detach_dev(t);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(109:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (107:4) {#if module_config.is_loading}
    function create_if_block_2$1(ctx) {
    	let progressbar;
    	let current;

    	progressbar = new Progressbar({
    			props: { module: "session requests" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(progressbar.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(progressbar, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progressbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progressbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(progressbar, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(107:4) {#if module_config.is_loading}",
    		ctx
    	});

    	return block;
    }

    // (134:6) {:else}
    function create_else_block_1(ctx) {
    	let div;
    	let titlebar;
    	let current;

    	titlebar = new Title({
    			props: {
    				message: "create sessions to spread the knowledge"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(titlebar.$$.fragment);
    			attr_dev(div, "class", "box");
    			add_location(div, file$1, 134, 8, 3954);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(titlebar, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(titlebar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(titlebar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(titlebar);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(134:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (111:6) {#if $sessionrequests.length > 0}
    function create_if_block_3(ctx) {
    	let div;
    	let each_value = /*$sessionrequests*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "box");
    			add_location(div, file$1, 111, 8, 3083);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rejectsession, $sessionrequests, approvesession*/ 100) {
    				each_value = /*$sessionrequests*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(111:6) {#if $sessionrequests.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (113:10) {#each $sessionrequests as session}
    function create_each_block$1(ctx) {
    	let article;
    	let div0;
    	let t0_value = /*session*/ ctx[10].title + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2_value = /*session*/ ctx[10].scheduled + "";
    	let t2;
    	let t3;
    	let div2;
    	let t4_value = /*session*/ ctx[10].description + "";
    	let t4;
    	let t5;
    	let div3;
    	let t6_value = /*session*/ ctx[10].presenter + "";
    	let t6;
    	let t7;
    	let div4;
    	let button0;
    	let t9;
    	let button1;
    	let t11;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[7](/*session*/ ctx[10]);
    	}

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[8](/*session*/ ctx[10]);
    	}

    	const block = {
    		c: function create() {
    			article = element("article");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			div2 = element("div");
    			t4 = text(t4_value);
    			t5 = space();
    			div3 = element("div");
    			t6 = text(t6_value);
    			t7 = space();
    			div4 = element("div");
    			button0 = element("button");
    			button0.textContent = "Approve";
    			t9 = space();
    			button1 = element("button");
    			button1.textContent = "Reject";
    			t11 = space();
    			attr_dev(div0, "class", "column title svelte-d6y4v0");
    			add_location(div0, file$1, 114, 14, 3197);
    			attr_dev(div1, "class", "column schedule");
    			add_location(div1, file$1, 115, 14, 3259);
    			attr_dev(div2, "class", "column schedule");
    			add_location(div2, file$1, 116, 14, 3328);
    			attr_dev(div3, "class", "column presenter");
    			add_location(div3, file$1, 117, 14, 3399);
    			attr_dev(button0, "class", "button is-primary");
    			add_location(button0, file$1, 119, 16, 3514);
    			attr_dev(button1, "class", "button is-danger");
    			add_location(button1, file$1, 124, 16, 3694);
    			attr_dev(div4, "class", "column buttons");
    			add_location(div4, file$1, 118, 14, 3469);
    			attr_dev(article, "class", "media svelte-d6y4v0");
    			add_location(article, file$1, 113, 12, 3159);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, div0);
    			append_dev(div0, t0);
    			append_dev(article, t1);
    			append_dev(article, div1);
    			append_dev(div1, t2);
    			append_dev(article, t3);
    			append_dev(article, div2);
    			append_dev(div2, t4);
    			append_dev(article, t5);
    			append_dev(article, div3);
    			append_dev(div3, t6);
    			append_dev(article, t7);
    			append_dev(article, div4);
    			append_dev(div4, button0);
    			append_dev(div4, t9);
    			append_dev(div4, button1);
    			append_dev(article, t11);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", click_handler, false, false, false),
    					listen_dev(button1, "click", click_handler_1, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$sessionrequests*/ 4 && t0_value !== (t0_value = /*session*/ ctx[10].title + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*$sessionrequests*/ 4 && t2_value !== (t2_value = /*session*/ ctx[10].scheduled + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*$sessionrequests*/ 4 && t4_value !== (t4_value = /*session*/ ctx[10].description + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*$sessionrequests*/ 4 && t6_value !== (t6_value = /*session*/ ctx[10].presenter + "")) set_data_dev(t6, t6_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(113:10) {#each $sessionrequests as session}",
    		ctx
    	});

    	return block;
    }

    // (145:2) {#if module_config.show_notification}
    function create_if_block$1(ctx) {
    	let notify;
    	let current;

    	notify = new Notify({
    			props: { config: /*notifyConfig*/ ctx[1] },
    			$$inline: true
    		});

    	notify.$on("closenotify", /*closenotify*/ ctx[4]);

    	const block = {
    		c: function create() {
    			create_component(notify.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(notify, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const notify_changes = {};
    			if (dirty & /*notifyConfig*/ 2) notify_changes.config = /*notifyConfig*/ ctx[1];
    			notify.$set(notify_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(notify.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(notify.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(notify, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(145:2) {#if module_config.show_notification}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block0;
    	let t;
    	let current;
    	const if_block_creators = [create_if_block_1$1, create_else_block_2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$isAdmin*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = /*module_config*/ ctx[0].show_notification && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div, "class", "container svelte-d6y4v0");
    			add_location(div, file$1, 104, 0, 2831);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			append_dev(div, t);
    			if (if_block1) if_block1.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(div, t);
    			}

    			if (/*module_config*/ ctx[0].show_notification) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*module_config*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let notifyConfig;
    	let $sessionrequests;
    	let $token;
    	let $isAdmin;
    	validate_store(sessionrequests, 'sessionrequests');
    	component_subscribe($$self, sessionrequests, $$value => $$invalidate(2, $sessionrequests = $$value));
    	validate_store(token, 'token');
    	component_subscribe($$self, token, $$value => $$invalidate(9, $token = $$value));
    	validate_store(isAdmin, 'isAdmin');
    	component_subscribe($$self, isAdmin, $$value => $$invalidate(3, $isAdmin = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Sessionrequest', slots, []);

    	let module_config = {
    		is_presenter_sessions_loading: false,
    		is_loading: false,
    		show_presenter_info: false,
    		progres_bar_message: "",
    		add_new_presenter: false,
    		show_add_session: false,
    		show_notification: false
    	};

    	onMount(async () => {
    		if ($isAdmin) {
    			$$invalidate(0, module_config.is_loading = true, module_config);
    			const url = `${apihost}/${appModules.sessionrequest}`;
    			const headers = getAuthHeaders($token);
    			const result = await axios.get(url, headers).then(res => res.data);

    			result.forEach(d => {
    				d["scheduled"] = getFormattedDate(d, "scheduledon");
    			});

    			set_store_value(sessionrequests, $sessionrequests = result, $sessionrequests);
    			$$invalidate(0, module_config.is_loading = false, module_config);
    		}
    	});

    	const closenotify = () => $$invalidate(0, module_config["show_notification"] = false, module_config);

    	const approvesession = async session => {
    		try {
    			const url = `${apihost}/${appModules.sessionrequest}/${session.id}`;
    			const headers = getAuthHeaders($token);
    			session.status = 200; //approve
    			const result = await axios.put(url, session, headers).then(res => res.data);

    			if (result) {
    				set_store_value(sessionrequests, $sessionrequests = $sessionrequests.filter(ses => ses.id !== session.id), $sessionrequests);
    				$$invalidate(1, notifyConfig["message"] = `${session.title} is approved`, notifyConfig);
    				$$invalidate(0, module_config["show_notification"] = true, module_config);
    			}
    		} catch(error) {
    			console.log(error);
    		}
    	};

    	const rejectsession = async session => {
    		try {
    			const url = `${apihost}/${appModules.sessionrequest}/${session.id}`;
    			const headers = getAuthHeaders($token);
    			session.status = 300; //approve
    			const result = await axios.put(url, session, headers).then(res => res.data);

    			if (result) {
    				set_store_value(sessionrequests, $sessionrequests = $sessionrequests.filter(ses => ses.id !== session.id), $sessionrequests);
    				$$invalidate(1, notifyConfig["message"] = `${session.title} is approved`, notifyConfig);
    				$$invalidate(0, module_config["show_notification"] = true, module_config);
    			}
    		} catch(error) {
    			console.log(error);
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Sessionrequest> was created with unknown prop '${key}'`);
    	});

    	const click_handler = session => approvesession(session);
    	const click_handler_1 = session => rejectsession(session);

    	$$self.$capture_state = () => ({
    		axios,
    		onMount,
    		apihost,
    		appModules,
    		getAuthHeaders,
    		getDateParts,
    		getFormattedDate,
    		sessionrequests,
    		isAdmin,
    		token,
    		TitleBar: Title,
    		ProgressBar: Progressbar,
    		Notify,
    		UnAuthorizedView: Unauthorized,
    		module_config,
    		closenotify,
    		approvesession,
    		rejectsession,
    		notifyConfig,
    		$sessionrequests,
    		$token,
    		$isAdmin
    	});

    	$$self.$inject_state = $$props => {
    		if ('module_config' in $$props) $$invalidate(0, module_config = $$props.module_config);
    		if ('notifyConfig' in $$props) $$invalidate(1, notifyConfig = $$props.notifyConfig);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(1, notifyConfig = { cssClass: "is-info" });

    	return [
    		module_config,
    		notifyConfig,
    		$sessionrequests,
    		$isAdmin,
    		closenotify,
    		approvesession,
    		rejectsession,
    		click_handler,
    		click_handler_1
    	];
    }

    class Sessionrequest extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sessionrequest",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/pages/user/index.svelte generated by Svelte v3.40.1 */
    const file = "src/pages/user/index.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (83:2) {:else}
    function create_else_block(ctx) {
    	let titlebar;
    	let t;
    	let each_1_anchor;
    	let current;

    	titlebar = new Title({
    			props: { message: "Current Sessions in māhita" },
    			$$inline: true
    		});

    	let each_value = /*$sessions*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			create_component(titlebar.$$.fragment);
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			mount_component(titlebar, target, anchor);
    			insert_dev(target, t, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$sessions, enroll*/ 12) {
    				each_value = /*$sessions*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(titlebar.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(titlebar.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(titlebar, detaching);
    			if (detaching) detach_dev(t);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(83:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (81:2) {#if module_config.is_loading}
    function create_if_block_2(ctx) {
    	let progressbar;
    	let current;

    	progressbar = new Progressbar({
    			props: { module: "session" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(progressbar.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(progressbar, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progressbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progressbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(progressbar, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(81:2) {#if module_config.is_loading}",
    		ctx
    	});

    	return block;
    }

    // (85:4) {#each $sessions as session}
    function create_each_block(ctx) {
    	let sessioncard;
    	let current;

    	function click_handler() {
    		return /*click_handler*/ ctx[6](/*session*/ ctx[9]);
    	}

    	sessioncard = new Sessioncard({
    			props: { role: "user", data: /*session*/ ctx[9] },
    			$$inline: true
    		});

    	sessioncard.$on("click", click_handler);

    	const block = {
    		c: function create() {
    			create_component(sessioncard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(sessioncard, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const sessioncard_changes = {};
    			if (dirty & /*$sessions*/ 4) sessioncard_changes.data = /*session*/ ctx[9];
    			sessioncard.$set(sessioncard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sessioncard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sessioncard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sessioncard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(85:4) {#each $sessions as session}",
    		ctx
    	});

    	return block;
    }

    // (92:2) {#if module_config.showModal}
    function create_if_block_1(ctx) {
    	let modal;
    	let current;

    	modal = new Modal({
    			props: {
    				message: "Please login to the system to enroll"
    			},
    			$$inline: true
    		});

    	modal.$on("click", /*modalClose*/ ctx[4]);

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(92:2) {#if module_config.showModal}",
    		ctx
    	});

    	return block;
    }

    // (98:2) {#if module_config.show_notification}
    function create_if_block(ctx) {
    	let notify;
    	let current;

    	notify = new Notify({
    			props: { config: /*notifyConfig*/ ctx[1] },
    			$$inline: true
    		});

    	notify.$on("closenotify", /*closenotify*/ ctx[5]);

    	const block = {
    		c: function create() {
    			create_component(notify.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(notify, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const notify_changes = {};
    			if (dirty & /*notifyConfig*/ 2) notify_changes.config = /*notifyConfig*/ ctx[1];
    			notify.$set(notify_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(notify.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(notify.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(notify, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(98:2) {#if module_config.show_notification}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block0;
    	let t0;
    	let t1;
    	let meeting;
    	let t2;
    	let current;
    	const if_block_creators = [create_if_block_2, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*module_config*/ ctx[0].is_loading) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = /*module_config*/ ctx[0].showModal && create_if_block_1(ctx);
    	meeting = new Meeting({ $$inline: true });
    	let if_block2 = /*module_config*/ ctx[0].show_notification && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			create_component(meeting.$$.fragment);
    			t2 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(div, "class", "container svelte-x9l5y8");
    			add_location(div, file, 79, 0, 2172);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);
    			mount_component(meeting, div, null);
    			append_dev(div, t2);
    			if (if_block2) if_block2.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(div, t0);
    			}

    			if (/*module_config*/ ctx[0].showModal) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*module_config*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*module_config*/ ctx[0].show_notification) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*module_config*/ 1) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(meeting.$$.fragment, local);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(meeting.$$.fragment, local);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    			if (if_block1) if_block1.d();
    			destroy_component(meeting);
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let notifyConfig;
    	let $token;
    	let $loggedInUserId;
    	let $sessions;
    	validate_store(token, 'token');
    	component_subscribe($$self, token, $$value => $$invalidate(7, $token = $$value));
    	validate_store(loggedInUserId, 'loggedInUserId');
    	component_subscribe($$self, loggedInUserId, $$value => $$invalidate(8, $loggedInUserId = $$value));
    	validate_store(sessions, 'sessions');
    	component_subscribe($$self, sessions, $$value => $$invalidate(2, $sessions = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('User', slots, []);

    	let module_config = {
    		showModal: false,
    		is_loading: false,
    		show_notification: false
    	};

    	onMount(async () => {
    		$$invalidate(0, module_config.is_loading = true, module_config);
    		const url = apihost + "/" + appModules.session;
    		const result = await axios.get(url, getAuthHeaders($token)).then(res => res.data);
    		set_store_value(sessions, $sessions = result.map(data => getDateParts(data, "scheduledon")).sort((a, b) => new Date(b["scheduledon"]) - new Date(a["scheduledon"])), $sessions);
    		$$invalidate(0, module_config.is_loading = false, module_config);
    	});

    	const enroll = async session => {
    		try {
    			const id = $loggedInUserId;
    			const url = `${apihost}/${appModules.session}/enroll/${id}`;
    			const result = await axios.post(url, session, getAuthHeaders($token)).then(res => res.data);

    			if (result) {
    				$$invalidate(1, notifyConfig = {
    					cssClass: "is-info",
    					message: `Successfully enrolled for ${session.title}`
    				});

    				$$invalidate(0, module_config.show_notification = true, module_config);
    			}
    		} catch(error) {
    			$$invalidate(1, notifyConfig = {
    				cssClass: "is-error",
    				message: `Issue encountered to enroll for ${session.title}`
    			});

    			$$invalidate(0, module_config.show_notification = true, module_config);
    		}
    	};

    	const modalClose = () => $$invalidate(0, module_config.showModal = false, module_config);

    	const closenotify = () => {
    		$$invalidate(0, module_config.show_notification = false, module_config);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<User> was created with unknown prop '${key}'`);
    	});

    	const click_handler = session => enroll(session);

    	$$self.$capture_state = () => ({
    		onMount,
    		axios,
    		TitleBar: Title,
    		ProgressBar: Progressbar,
    		Modal,
    		SessionCard: Sessioncard,
    		Meeting,
    		Notify,
    		apihost,
    		appModules,
    		getDateParts,
    		getAuthHeaders,
    		sessions,
    		loggedInUserId,
    		token,
    		module_config,
    		enroll,
    		modalClose,
    		closenotify,
    		notifyConfig,
    		$token,
    		$loggedInUserId,
    		$sessions
    	});

    	$$self.$inject_state = $$props => {
    		if ('module_config' in $$props) $$invalidate(0, module_config = $$props.module_config);
    		if ('notifyConfig' in $$props) $$invalidate(1, notifyConfig = $$props.notifyConfig);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(1, notifyConfig = { cssClass: "is-info" });

    	return [
    		module_config,
    		notifyConfig,
    		$sessions,
    		enroll,
    		modalClose,
    		closenotify,
    		click_handler
    	];
    }

    class User extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "User",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    //tree
    const _tree = {
      "name": "root",
      "filepath": "/",
      "root": true,
      "ownMeta": {},
      "absolutePath": "src/pages",
      "children": [
        {
          "isFile": true,
          "isDir": false,
          "file": "_layout.svelte",
          "filepath": "/_layout.svelte",
          "name": "_layout",
          "ext": "svelte",
          "badExt": false,
          "absolutePath": "/Users/hola/Downloads/maahita/src/pages/_layout.svelte",
          "importPath": "../../../../src/pages/_layout.svelte",
          "isLayout": true,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/",
          "id": "__layout",
          "component": () => Layout
        },
        {
          "isFile": false,
          "isDir": true,
          "file": "account",
          "filepath": "/account",
          "name": "account",
          "ext": "",
          "badExt": false,
          "absolutePath": "/Users/hola/Downloads/maahita/src/pages/account",
          "children": [
            {
              "isFile": true,
              "isDir": false,
              "file": "index.svelte",
              "filepath": "/account/index.svelte",
              "name": "index",
              "ext": "svelte",
              "badExt": false,
              "absolutePath": "/Users/hola/Downloads/maahita/src/pages/account/index.svelte",
              "importPath": "../../../../src/pages/account/index.svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": true,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/account/index",
              "id": "_account_index",
              "component": () => Account
            }
          ],
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/account"
        },
        {
          "isFile": false,
          "isDir": true,
          "file": "admin",
          "filepath": "/admin",
          "name": "admin",
          "ext": "",
          "badExt": false,
          "absolutePath": "/Users/hola/Downloads/maahita/src/pages/admin",
          "children": [
            {
              "isFile": true,
              "isDir": false,
              "file": "index.svelte",
              "filepath": "/admin/index.svelte",
              "name": "index",
              "ext": "svelte",
              "badExt": false,
              "absolutePath": "/Users/hola/Downloads/maahita/src/pages/admin/index.svelte",
              "importPath": "../../../../src/pages/admin/index.svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": true,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/admin/index",
              "id": "_admin_index",
              "component": () => Admin
            }
          ],
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/admin"
        },
        {
          "isFile": false,
          "isDir": true,
          "file": "components",
          "filepath": "/components",
          "name": "components",
          "ext": "",
          "badExt": false,
          "absolutePath": "/Users/hola/Downloads/maahita/src/pages/components",
          "children": [
            {
              "isFile": true,
              "isDir": false,
              "file": "addpresenter.svelte",
              "filepath": "/components/addpresenter.svelte",
              "name": "addpresenter",
              "ext": "svelte",
              "badExt": false,
              "absolutePath": "/Users/hola/Downloads/maahita/src/pages/components/addpresenter.svelte",
              "importPath": "../../../../src/pages/components/addpresenter.svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/components/addpresenter",
              "id": "_components_addpresenter",
              "component": () => Addpresenter
            },
            {
              "isFile": true,
              "isDir": false,
              "file": "addsession.svelte",
              "filepath": "/components/addsession.svelte",
              "name": "addsession",
              "ext": "svelte",
              "badExt": false,
              "absolutePath": "/Users/hola/Downloads/maahita/src/pages/components/addsession.svelte",
              "importPath": "../../../../src/pages/components/addsession.svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/components/addsession",
              "id": "_components_addsession",
              "component": () => Addsession
            },
            {
              "isFile": true,
              "isDir": false,
              "file": "meeting.svelte",
              "filepath": "/components/meeting.svelte",
              "name": "meeting",
              "ext": "svelte",
              "badExt": false,
              "absolutePath": "/Users/hola/Downloads/maahita/src/pages/components/meeting.svelte",
              "importPath": "../../../../src/pages/components/meeting.svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/components/meeting",
              "id": "_components_meeting",
              "component": () => Meeting
            },
            {
              "isFile": true,
              "isDir": false,
              "file": "modal.svelte",
              "filepath": "/components/modal.svelte",
              "name": "modal",
              "ext": "svelte",
              "badExt": false,
              "absolutePath": "/Users/hola/Downloads/maahita/src/pages/components/modal.svelte",
              "importPath": "../../../../src/pages/components/modal.svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/components/modal",
              "id": "_components_modal",
              "component": () => Modal
            },
            {
              "isFile": true,
              "isDir": false,
              "file": "navbar.svelte",
              "filepath": "/components/navbar.svelte",
              "name": "navbar",
              "ext": "svelte",
              "badExt": false,
              "absolutePath": "/Users/hola/Downloads/maahita/src/pages/components/navbar.svelte",
              "importPath": "../../../../src/pages/components/navbar.svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/components/navbar",
              "id": "_components_navbar",
              "component": () => Navbar
            },
            {
              "isFile": true,
              "isDir": false,
              "file": "notify.svelte",
              "filepath": "/components/notify.svelte",
              "name": "notify",
              "ext": "svelte",
              "badExt": false,
              "absolutePath": "/Users/hola/Downloads/maahita/src/pages/components/notify.svelte",
              "importPath": "../../../../src/pages/components/notify.svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/components/notify",
              "id": "_components_notify",
              "component": () => Notify
            },
            {
              "isFile": true,
              "isDir": false,
              "file": "presentercard.svelte",
              "filepath": "/components/presentercard.svelte",
              "name": "presentercard",
              "ext": "svelte",
              "badExt": false,
              "absolutePath": "/Users/hola/Downloads/maahita/src/pages/components/presentercard.svelte",
              "importPath": "../../../../src/pages/components/presentercard.svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/components/presentercard",
              "id": "_components_presentercard",
              "component": () => Presentercard
            },
            {
              "isFile": true,
              "isDir": false,
              "file": "presenterview.svelte",
              "filepath": "/components/presenterview.svelte",
              "name": "presenterview",
              "ext": "svelte",
              "badExt": false,
              "absolutePath": "/Users/hola/Downloads/maahita/src/pages/components/presenterview.svelte",
              "importPath": "../../../../src/pages/components/presenterview.svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/components/presenterview",
              "id": "_components_presenterview",
              "component": () => Presenterview
            },
            {
              "isFile": true,
              "isDir": false,
              "file": "progressbar.svelte",
              "filepath": "/components/progressbar.svelte",
              "name": "progressbar",
              "ext": "svelte",
              "badExt": false,
              "absolutePath": "/Users/hola/Downloads/maahita/src/pages/components/progressbar.svelte",
              "importPath": "../../../../src/pages/components/progressbar.svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/components/progressbar",
              "id": "_components_progressbar",
              "component": () => Progressbar
            },
            {
              "isFile": true,
              "isDir": false,
              "file": "sessioncard.svelte",
              "filepath": "/components/sessioncard.svelte",
              "name": "sessioncard",
              "ext": "svelte",
              "badExt": false,
              "absolutePath": "/Users/hola/Downloads/maahita/src/pages/components/sessioncard.svelte",
              "importPath": "../../../../src/pages/components/sessioncard.svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/components/sessioncard",
              "id": "_components_sessioncard",
              "component": () => Sessioncard
            },
            {
              "isFile": true,
              "isDir": false,
              "file": "title.svelte",
              "filepath": "/components/title.svelte",
              "name": "title",
              "ext": "svelte",
              "badExt": false,
              "absolutePath": "/Users/hola/Downloads/maahita/src/pages/components/title.svelte",
              "importPath": "../../../../src/pages/components/title.svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/components/title",
              "id": "_components_title",
              "component": () => Title
            },
            {
              "isFile": true,
              "isDir": false,
              "file": "unauthorized.svelte",
              "filepath": "/components/unauthorized.svelte",
              "name": "unauthorized",
              "ext": "svelte",
              "badExt": false,
              "absolutePath": "/Users/hola/Downloads/maahita/src/pages/components/unauthorized.svelte",
              "importPath": "../../../../src/pages/components/unauthorized.svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/components/unauthorized",
              "id": "_components_unauthorized",
              "component": () => Unauthorized
            }
          ],
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/components"
        },
        {
          "isFile": true,
          "isDir": false,
          "file": "index.svelte",
          "filepath": "/index.svelte",
          "name": "index",
          "ext": "svelte",
          "badExt": false,
          "absolutePath": "/Users/hola/Downloads/maahita/src/pages/index.svelte",
          "importPath": "../../../../src/pages/index.svelte",
          "isLayout": false,
          "isReset": false,
          "isIndex": true,
          "isFallback": false,
          "isPage": true,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/index",
          "id": "_index",
          "component": () => Pages
        },
        {
          "isFile": false,
          "isDir": true,
          "file": "presenter",
          "filepath": "/presenter",
          "name": "presenter",
          "ext": "",
          "badExt": false,
          "absolutePath": "/Users/hola/Downloads/maahita/src/pages/presenter",
          "children": [
            {
              "isFile": true,
              "isDir": false,
              "file": "index.svelte",
              "filepath": "/presenter/index.svelte",
              "name": "index",
              "ext": "svelte",
              "badExt": false,
              "absolutePath": "/Users/hola/Downloads/maahita/src/pages/presenter/index.svelte",
              "importPath": "../../../../src/pages/presenter/index.svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": true,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/presenter/index",
              "id": "_presenter_index",
              "component": () => Presenter
            }
          ],
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/presenter"
        },
        {
          "isFile": false,
          "isDir": true,
          "file": "sessionrequest",
          "filepath": "/sessionrequest",
          "name": "sessionrequest",
          "ext": "",
          "badExt": false,
          "absolutePath": "/Users/hola/Downloads/maahita/src/pages/sessionrequest",
          "children": [
            {
              "isFile": true,
              "isDir": false,
              "file": "index.svelte",
              "filepath": "/sessionrequest/index.svelte",
              "name": "index",
              "ext": "svelte",
              "badExt": false,
              "absolutePath": "/Users/hola/Downloads/maahita/src/pages/sessionrequest/index.svelte",
              "importPath": "../../../../src/pages/sessionrequest/index.svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": true,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/sessionrequest/index",
              "id": "_sessionrequest_index",
              "component": () => Sessionrequest
            }
          ],
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/sessionrequest"
        },
        {
          "isFile": false,
          "isDir": true,
          "file": "user",
          "filepath": "/user",
          "name": "user",
          "ext": "",
          "badExt": false,
          "absolutePath": "/Users/hola/Downloads/maahita/src/pages/user",
          "children": [
            {
              "isFile": true,
              "isDir": false,
              "file": "index.svelte",
              "filepath": "/user/index.svelte",
              "name": "index",
              "ext": "svelte",
              "badExt": false,
              "absolutePath": "/Users/hola/Downloads/maahita/src/pages/user/index.svelte",
              "importPath": "../../../../src/pages/user/index.svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": true,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/user/index",
              "id": "_user_index",
              "component": () => User
            }
          ],
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/user"
        }
      ],
      "isLayout": false,
      "isReset": false,
      "isIndex": false,
      "isFallback": false,
      "meta": {
        "preload": false,
        "prerender": true,
        "precache-order": false,
        "precache-proximity": true,
        "recursive": true
      },
      "path": "/"
    };


    const {tree, routes} = buildClientTree(_tree);

    /* src/App.svelte generated by Svelte v3.40.1 */

    function create_fragment(ctx) {
    	let router;
    	let current;
    	router = new Router({ props: { routes }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Router, url, routes });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
