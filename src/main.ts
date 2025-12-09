import "./style.css";
import { PLAYER_1, on, SYSTEM, PLAYER_2 } from "@rcade/plugin-input-classic";
import {
  PLAYER_1 as PLAYER_1_SPINNER,
  PLAYER_2 as PLAYER_2_SPINNER,
} from "@rcade/plugin-input-spinners";
import * as Tone from "tone";
import { TROMBONE_URLS } from "./instruments";

const overlay = document.querySelector<HTMLDivElement>("#overlay")!;
const instrument_1_element =
  document.querySelector<HTMLDivElement>("#instrument-1")!;
const instrument_2_element =
  document.querySelector<HTMLDivElement>("#instrument-2")!;

let gameStarted = false;

const NOTE_E2 = 82.41;
const NOTE_Bb4 = 466.16;

const MIN_NOTE = NOTE_E2;
const MAX_NOTE = NOTE_Bb4;

function mapToFrequencyLog(x: number): number {
  return MIN_NOTE * Math.pow(MAX_NOTE / MIN_NOTE, x);
}

function clampPositon(x: number) {
  if (x < 0) {
    return 0;
  } else if (x > 100) {
    return 100;
  }
  return x;
}

type PlayerState = {
  instrument: Tone.Sampler | undefined;
  position: number;
  previousPosition: number;
};

const player_1_state: PlayerState = {
  instrument: undefined,
  position: 50,
  previousPosition: 0,
};
const player_2_state: PlayerState = {
  instrument: undefined,
  position: 50,
  previousPosition: 0,
};

function positionToFrequency(pos: number) {
  return mapToFrequencyLog(pos / 100);
}

on("inputStart", (input) => {
  if (input.player === 1 && input.pressed && input.button === "A") {
    instrument_1_element.classList.add("playing");
  }
  if (input.player === 2 && input.pressed && input.button === "A") {
    instrument_2_element.classList.add("playing");
  }
});

on("inputEnd", (input) => {
  if (input.player === 1 && !input.pressed && input.button === "A") {
    instrument_1_element.classList.remove("playing");
    const frequency = positionToFrequency(player_1_state.position);
    player_1_state.instrument?.triggerRelease(frequency);
  }

  if (input.player === 2 && !input.pressed && input.button === "A") {
    instrument_2_element.classList.remove("playing");
    const frequency = positionToFrequency(player_2_state.position);
    player_2_state.instrument?.triggerRelease(frequency);
  }
});

function update() {
  if (!gameStarted) {
    if (SYSTEM.TWO_PLAYER) {
      gameStarted = true;
      Tone.start();
      overlay.remove();

      player_1_state.instrument = new Tone.Sampler({
        urls: TROMBONE_URLS,
        onerror: (err) => {
          console.log(err);
        },
        onload: () => {
          console.log("loaded!");
        },
        volume: 0.5,
      }).toDestination();

      player_2_state.instrument = new Tone.Sampler({
        urls: TROMBONE_URLS,
        onerror: (err) => {
          console.log(err);
        },
        onload: () => {
          console.log("loaded!");
        },
        volume: 0.5,
      }).toDestination();
    }
  } else {
    player_1_state.previousPosition = player_1_state.position;
    player_2_state.previousPosition = player_2_state.position;

    player_1_state.position +=
      (PLAYER_1_SPINNER.SPINNER.step_delta /
        PLAYER_1_SPINNER.SPINNER.step_resolution) *
      40;
    player_1_state.position = clampPositon(player_1_state.position);

    player_2_state.position +=
      (PLAYER_2_SPINNER.SPINNER.step_delta /
        PLAYER_2_SPINNER.SPINNER.step_resolution) *
      40;
    player_2_state.position = clampPositon(player_2_state.position);

    if (PLAYER_1.A && !!player_1_state.instrument) {
      const previousFrequency = positionToFrequency(
        player_1_state.previousPosition,
      );
      const currentFrequency = positionToFrequency(player_1_state.position);

      player_1_state.instrument.triggerAttack(currentFrequency);

      // console.log(previousFrequency, currentFrequency);
      if (player_1_state.position !== player_1_state.previousPosition) {
        player_1_state.instrument?.triggerRelease(previousFrequency);
        player_1_state.instrument?.triggerAttack(currentFrequency);
      }
    }
    if (PLAYER_2.A && !!player_2_state.instrument) {
      const previousFrequency = positionToFrequency(
        player_2_state.previousPosition,
      );
      const currentFrequency = positionToFrequency(player_2_state.position);

      player_2_state.instrument.triggerAttack(currentFrequency);

      // console.log(previousFrequency, currentFrequency);
      if (player_2_state.position !== player_2_state.previousPosition) {
        player_2_state.instrument?.triggerRelease(previousFrequency);
        player_2_state.instrument?.triggerAttack(currentFrequency);
      }
    }

    instrument_1_element.style = `width: ${100 - player_1_state.position}%`;
    instrument_2_element.style = `width: ${100 - player_2_state.position}%`;
  }

  requestAnimationFrame(update);
}

update();
