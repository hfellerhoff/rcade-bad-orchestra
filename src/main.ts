import "./style.css";
import { PLAYER_1, on, SYSTEM, PLAYER_2 } from "@rcade/plugin-input-classic";
import {
  PLAYER_1 as PLAYER_1_SPINNER,
  PLAYER_2 as PLAYER_2_SPINNER,
} from "@rcade/plugin-input-spinners";
import * as Tone from "tone";
import {
  INSTRUMENT_RANGES,
  SAXOPHONE_URLS,
  TROMBONE_URLS,
  URLS_BY_INSTRUMENT,
  type InstrumentName,
} from "./instruments";

const overlay = document.querySelector<HTMLDivElement>("#overlay")!;
const instrument_1_element =
  document.querySelector<HTMLImageElement>("#instrument-1")!;
const instrument_2_element =
  document.querySelector<HTMLImageElement>("#instrument-2")!;

const instrument_chooser_1_element = document.querySelector(
  "#instrument-chooser-1",
)!;
const instrument_chooser_2_element = document.querySelector(
  "#instrument-chooser-2",
)!;

const player_1_instrument_options = Array.from(
  document.querySelectorAll(".instrument-option-1")!,
);
const player_2_instrument_options = Array.from(
  document.querySelectorAll(".instrument-option-2")!,
);

let gameStarted = false;

function positionToFrequency(
  x: number,
  instrumentName: InstrumentName,
): number {
  const { min, max } = INSTRUMENT_RANGES[instrumentName];

  const value = min * Math.pow(max / min, x / 100);
  return value;
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
  instrumentName: InstrumentName;
  instrument: Tone.Sampler | undefined;
  position: number;
  previousPosition: number;
};

const player_1_state: PlayerState = {
  instrumentName: "trombone",
  instrument: undefined,
  position: 50,
  previousPosition: 0,
};
const player_2_state: PlayerState = {
  instrumentName: "trombone",
  instrument: undefined,
  position: 50,
  previousPosition: 0,
};

function assignInstrument(
  instrumentName: InstrumentName,
  state: PlayerState,
  imageElement: HTMLImageElement,
) {
  state.instrument?.disconnect();

  state.instrument = new Tone.Sampler({
    urls: URLS_BY_INSTRUMENT[instrumentName],
    onerror: (err) => {
      console.log(err);
    },
    onload: () => {
      console.log("loaded!");
    },
    volume: 0.5,
  }).toDestination();

  imageElement.src = `/${instrumentName}.png`;
  state.instrumentName = instrumentName;
  state.position = 50;
  state.previousPosition = 0;
}

on("inputStart", (input) => {
  if (input.player === 1 && input.pressed && input.button === "A") {
    instrument_1_element.classList.add("playing");
  }
  if (input.player === 2 && input.pressed && input.button === "A") {
    instrument_2_element.classList.add("playing");
  }

  if (input.player == 1 && input.button === "B") {
    if (instrument_chooser_1_element.classList.contains("hidden")) {
      instrument_chooser_1_element.classList.remove("hidden");
    } else {
      instrument_chooser_1_element.classList.add("hidden");

      const chosenInstrument = (player_1_instrument_options
        .find((option) => option.classList.contains("instrument-chosen"))!
        .getAttribute("data-name") ?? "trombone") as InstrumentName;

      assignInstrument(chosenInstrument, player_1_state, instrument_1_element);
    }
  }
  if (input.player == 2 && input.button === "B") {
    if (instrument_chooser_2_element.classList.contains("hidden")) {
      instrument_chooser_2_element.classList.remove("hidden");
    } else {
      instrument_chooser_2_element.classList.add("hidden");

      const chosenInstrument = (player_2_instrument_options
        .find((option) => option.classList.contains("instrument-chosen"))!
        .getAttribute("data-name") ?? "trombone") as InstrumentName;

      assignInstrument(chosenInstrument, player_2_state, instrument_2_element);
    }
  }

  const isPlayer1ChooserActive =
    !instrument_chooser_1_element.classList.contains("hidden");
  if (input.player === 1 && input.button === "LEFT" && isPlayer1ChooserActive) {
    const chosenIndex = player_1_instrument_options.findIndex((option) =>
      option.classList.contains("instrument-chosen"),
    );

    if (chosenIndex === 0) {
      player_1_instrument_options[
        player_1_instrument_options.length - 1
      ].classList.add("instrument-chosen");
    } else {
      player_1_instrument_options[chosenIndex - 1].classList.add(
        "instrument-chosen",
      );
    }

    player_1_instrument_options[chosenIndex].classList.remove(
      "instrument-chosen",
    );
  }
  if (
    input.player === 1 &&
    input.button === "RIGHT" &&
    isPlayer1ChooserActive
  ) {
    const chosenIndex = player_1_instrument_options.findIndex((option) =>
      option.classList.contains("instrument-chosen"),
    );

    if (chosenIndex === player_1_instrument_options.length - 1) {
      player_1_instrument_options[0].classList.add("instrument-chosen");
    } else {
      player_1_instrument_options[chosenIndex + 1].classList.add(
        "instrument-chosen",
      );
    }

    player_1_instrument_options[chosenIndex].classList.remove(
      "instrument-chosen",
    );
  }

  const isPlayer2ChooserActive =
    !instrument_chooser_2_element.classList.contains("hidden");
  if (input.player === 2 && input.button === "LEFT" && isPlayer2ChooserActive) {
    const chosenIndex = player_2_instrument_options.findIndex((option) =>
      option.classList.contains("instrument-chosen"),
    );

    if (chosenIndex === 0) {
      player_2_instrument_options[
        player_2_instrument_options.length - 1
      ].classList.add("instrument-chosen");
    } else {
      player_2_instrument_options[chosenIndex - 1].classList.add(
        "instrument-chosen",
      );
    }

    player_2_instrument_options[chosenIndex].classList.remove(
      "instrument-chosen",
    );
  }
  if (
    input.player === 2 &&
    input.button === "RIGHT" &&
    isPlayer2ChooserActive
  ) {
    const chosenIndex = player_2_instrument_options.findIndex((option) =>
      option.classList.contains("instrument-chosen"),
    );

    if (chosenIndex === player_2_instrument_options.length - 1) {
      player_2_instrument_options[0].classList.add("instrument-chosen");
    } else {
      player_2_instrument_options[chosenIndex + 1].classList.add(
        "instrument-chosen",
      );
    }

    player_2_instrument_options[chosenIndex].classList.remove(
      "instrument-chosen",
    );
  }
});

on("inputEnd", (input) => {
  if (input.player === 1 && !input.pressed && input.button === "A") {
    instrument_1_element.classList.remove("playing");
    const frequency = positionToFrequency(
      player_1_state.position,
      player_1_state.instrumentName,
    );
    player_1_state.instrument?.triggerRelease(frequency);
  }

  if (input.player === 2 && !input.pressed && input.button === "A") {
    instrument_2_element.classList.remove("playing");
    const frequency = positionToFrequency(
      player_2_state.position,
      player_2_state.instrumentName,
    );
    player_2_state.instrument?.triggerRelease(frequency);
  }
});

function update() {
  if (!gameStarted) {
    if (SYSTEM.TWO_PLAYER) {
      gameStarted = true;
      Tone.start();
      overlay.remove();

      assignInstrument("trombone", player_1_state, instrument_1_element);
      assignInstrument("trombone", player_2_state, instrument_2_element);
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
        player_1_state.instrumentName,
      );
      const currentFrequency = positionToFrequency(
        player_1_state.position,
        player_1_state.instrumentName,
      );

      player_1_state.instrument.triggerAttack(currentFrequency);

      if (player_1_state.position !== player_1_state.previousPosition) {
        player_1_state.instrument?.triggerRelease(previousFrequency);
        player_1_state.instrument?.triggerAttack(currentFrequency);
      }
    }
    if (PLAYER_2.A && !!player_2_state.instrument) {
      const previousFrequency = positionToFrequency(
        player_2_state.previousPosition,
        player_2_state.instrumentName,
      );
      const currentFrequency = positionToFrequency(
        player_2_state.position,
        player_2_state.instrumentName,
      );

      player_2_state.instrument.triggerAttack(currentFrequency);

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
