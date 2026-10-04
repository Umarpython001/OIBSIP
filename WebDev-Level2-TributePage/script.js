// Example I from section 3 of "On Computable Numbers" (1936).
// Four m-configurations; it prints 0 and 1 on alternate squares, forever.
(function () {
    'use strict';

    var TABLE = {
        b: { print: '0', next: 'c', ops: 'print 0, move right' },
        c: { print: null, next: 'e', ops: 'move right' },
        e: { print: '1', next: 'f', ops: 'print 1, move right' },
        f: { print: null, next: 'b', ops: 'move right' }
    };

    var LEAD = 8;       // blank squares left of the starting square
    var LENGTH = 64;    // squares on the tape before it is wound back
    var INTERVAL = 750;

    var track = document.getElementById('tape-track');
    var readout = document.getElementById('readout');
    var controls = document.getElementById('controls');
    var btnRun = document.getElementById('btn-run');
    var btnStep = document.getElementById('btn-step');
    var btnReset = document.getElementById('btn-reset');
    var rows = document.querySelectorAll('#state-table tbody tr');
    if (!track || !controls) return;

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var cells = [];
    var pos, state, steps, timer = null, visible = true, userPaused = false;

    function build() {
        track.innerHTML = '';
        cells = [];
        for (var i = 0; i < LENGTH; i++) {
            var li = document.createElement('li');
            track.appendChild(li);
            cells.push(li);
        }
    }

    function render() {
        track.style.setProperty('--pos', pos);
        for (var i = 0; i < rows.length; i++) {
            rows[i].classList.toggle('is-active', rows[i].getAttribute('data-state') === state);
        }
    }

    function reset() {
        build();
        pos = LEAD;
        state = 'b';
        steps = 0;
        render();
        readout.textContent = 'Blank tape. The machine starts in configuration b.';
    }

    function step() {
        var rule = TABLE[state];
        var from = state;
        if (rule.print !== null) {
            var cell = cells[pos];
            cell.textContent = rule.print;
            cell.classList.remove('is-new');
            void cell.offsetWidth;
            cell.classList.add('is-new');
        }
        pos += 1;
        state = rule.next;
        steps += 1;
        render();
        readout.textContent = 'Step ' + steps + ': in ' + from + ', scanning a blank square: ' + rule.ops + ', go to ' + state + '.';

        if (pos >= LENGTH - 6) {
            // Wind the tape back rather than letting it run off the page.
            track.style.transition = 'none';
            reset();
            void track.offsetWidth;
            track.style.transition = '';
        }
    }

    function setRunning(on) {
        clearInterval(timer);
        timer = on ? setInterval(step, INTERVAL) : null;
        btnRun.setAttribute('aria-pressed', on ? 'true' : 'false');
        btnRun.textContent = on ? 'Pause' : 'Run';
        btnStep.disabled = on;
        // Announce manual steps only; a running machine would flood a screen reader.
        readout.setAttribute('aria-live', on ? 'off' : 'polite');
    }

    btnRun.addEventListener('click', function () {
        var on = timer === null;
        userPaused = !on;
        setRunning(on);
    });

    btnStep.addEventListener('click', step);

    btnReset.addEventListener('click', function () {
        userPaused = true;
        setRunning(false);
        reset();
    });

    // Pause while the tape is off screen; resume if it was running.
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
            visible = entries[0].isIntersecting;
            if (!visible && timer !== null) setRunning(false);
            else if (visible && timer === null && !userPaused && !reduceMotion) setRunning(true);
        }).observe(track);
    }

    controls.hidden = false;
    reset();
    if (reduceMotion) {
        // No autoplay, but show the machine's work as a still: twelve steps already taken.
        userPaused = true;
        setRunning(false);
        for (var i = 0; i < 12; i++) step();
        var printed = cells.filter(function (c) { return c.classList.remove('is-new') || c.textContent; }).length;
        readout.textContent = 'Stopped after 12 steps with ' + printed + ' figures printed. Press Run or Step to continue.';
    } else {
        setTimeout(function () { if (!userPaused && visible) setRunning(true); }, 600);
    }
})();
