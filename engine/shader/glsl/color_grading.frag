#version 310 es

#extension GL_GOOGLE_include_directive : enable

#include "constants.h"

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_color;

layout(set = 0, binding = 1) uniform sampler2D color_grading_lut_texture_sampler;

layout(location = 0) out highp vec4 out_color;

const highp float EPS = 0.0001;
const highp float LUT_COLOR = 16.0;

void main()
{
    highp ivec2 lut_tex_size = textureSize(color_grading_lut_texture_sampler, 0);
    highp float _COLORS      = float(lut_tex_size.y);

    highp vec4 color       = subpassLoad(in_color).rgba;
    
    // texture(color_grading_lut_texture_sampler, uv)
    // u in [0.0, 1.0]
    // v in [0.0, 1.0]
    // r [0.0, 1.0] <=> u [0.0, 1.0]
    // g [0.0, 1.0] <=> v [b / (1.0 / 16.0) + 1.0 / 16.0, b + 0.0]
    // b [0.0, 1.0] <=> v
    // b1 <=> floor(b * 16.0) / 16.0
    // b2 <=> ceil(b * 16.0 - EPS) / 16.0

    if (ENABLE_COLOR_GRADING) {
        highp float b1 = min(1.0 - EPS, color.b) * LUT_COLOR;

        highp float u1 = floor(b1) / LUT_COLOR + color.r / LUT_COLOR;
        highp float u2 = ceil(b1) / LUT_COLOR + color.r / LUT_COLOR;
        highp float v = color.g;

        highp vec4 color1 = texture(color_grading_lut_texture_sampler, vec2(u1, v));
        highp vec4 color2 = texture(color_grading_lut_texture_sampler, vec2(u2, v));
        highp vec4 lut_color = mix(color1, color2, b1 - floor(b1));

        out_color = lut_color;
    } else {
        out_color = color;
    }
}
