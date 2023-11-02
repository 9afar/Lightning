/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 Metrological
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import HoleShader from "./renderer/webgl/shaders/HoleShader.mjs";
import Application from "./application/Application.mjs";
import Utils from "./tree/Utils.mjs";
import StageUtils from "./tree/StageUtils.mjs";
import Texture from "./tree/Texture.mjs";
import Tools from "./tools/Tools.mjs";
import ImageTexture from "./textures/ImageTexture.mjs";
import EventEmitter from "./EventEmitter.mjs";
import WebGLDefaultShader from "./renderer/webgl/shaders/DefaultShader.mjs";
import OutlineShader from "./renderer/webgl/shaders/OutlineShader.mjs";
import RoundedRectangleShader from "./renderer/webgl/shaders/RoundedRectangleShader.mjs";
import VignetteShader from "./renderer/webgl/shaders/VignetteShader.mjs";

import Stage from "./tree/Stage.mjs";

const lightning = {
    Application,
    Utils,
    StageUtils,
    Tools,
    Stage,
    Texture,
    EventEmitter,
    shaders: {
        Outline: OutlineShader,
        RoundedRectangle: RoundedRectangleShader,
        Hole: HoleShader,
        Vignette: VignetteShader,
        WebGLDefaultShader,
    },
    textures: {
        ImageTexture,
    }
};

if (Utils.isWeb) {
    window.lng = lightning;
}
export default lightning;
