import "./style.css";
import { PLAYER_1, on, SYSTEM } from "@rcade/plugin-input-classic";
import { PLAYER_1 as PLAYER_1_SPINNER } from "@rcade/plugin-input-spinners";
import * as Tone from "tone";

const overlay = document.querySelector<HTMLDivElement>("#overlay")!;
const instrument = document.querySelector<HTMLDivElement>("#instrument")!;

let gameStarted = false;

const NOTE_E2 = 82.41;
const NOTE_Bb4 = 466.16;

const MIN_NOTE = NOTE_E2;
const MAX_NOTE = NOTE_Bb4;

function mapToFrequencyLog(x: number): number {
  return MIN_NOTE * Math.pow(MAX_NOTE / MIN_NOTE, x);
}

let position = 50;
let previousPosition = 0;

let trombone: Tone.Sampler | undefined = undefined;

function positionToFrequency(pos: number) {
  return mapToFrequencyLog(pos / 100);
}

on("inputStart", (input) => {
  if (input.player === 1 && input.pressed && input.button === "A") {
    instrument.classList.add("playing");
  }
});

on("inputEnd", (input) => {
  if (input.player === 1 && !input.pressed && input.button === "A") {
    instrument.classList.remove("playing");
    const frequency = positionToFrequency(position);
    trombone?.triggerRelease(frequency);
  }
});

function update() {
  if (!gameStarted) {
    if (SYSTEM.ONE_PLAYER) {
      gameStarted = true;
      Tone.start();
      overlay.remove();

      trombone = new Tone.Sampler({
        urls: {
          "A#1": "/assets/trombone/As1.ogg",
          "A#2": "/assets/trombone/As2.ogg",
          "A#3": "/assets/trombone/As3.ogg",
          C3: "/assets/trombone/C3.ogg",
          C4: "/assets/trombone/C4.ogg",
          "C#2": "/assets/trombone/Cs2.ogg",
          "C#4": "/assets/trombone/Cs4.ogg",
          D3: "/assets/trombone/D3.ogg",
          D4: "/assets/trombone/D4.ogg",
          "D#2": "/assets/trombone/Ds2.ogg",
          "D#3": "/assets/trombone/Ds3.ogg",
          "D#4": "/assets/trombone/Ds4.ogg",
          F2: "/assets/trombone/F2.ogg",
          F3: "/assets/trombone/F3.ogg",
          F4: "/assets/trombone/F4.ogg",
          "G#2": "/assets/trombone/Gs2.ogg",
          "G#3": "/assets/trombone/Gs3.ogg",
        },
        onerror: (err) => {
          console.log(err);
        },
        onload: () => {
          console.log("loaded!");
        },
      }).toDestination();

      console.log(trombone);
    }
  } else {
    previousPosition = position;
    position +=
      (PLAYER_1_SPINNER.SPINNER.step_delta /
        PLAYER_1_SPINNER.SPINNER.step_resolution) *
      40;

    if (position < 0) {
      position = 0;
    } else if (position > 100) {
      position = 100;
    }

    if (PLAYER_1.A && !!trombone) {
      const previousFrequency = positionToFrequency(previousPosition);
      const currentFrequency = positionToFrequency(position);

      trombone.triggerAttack(currentFrequency);

      // console.log(previousFrequency, currentFrequency);
      if (position !== previousPosition) {
        trombone?.triggerRelease(previousFrequency);
        trombone?.triggerAttack(currentFrequency);
      }
    }

    // const percentage = (position / (Math.PI * 2)) * 100;

    instrument.style = `width: ${100 - position}%`;
  }

  requestAnimationFrame(update);
}

update();
