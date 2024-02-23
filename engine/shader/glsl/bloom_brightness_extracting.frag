#version 310 es

#extension GL_GOOGLE_include_directive : enable

#include "constants.h"

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_color;

layout(location = 0) out highp vec4 out_color;

void main()
{
    highp vec3 color = subpassLoad(in_color).rgb;

    highp float lum = float(dot(color, vec3(0.299, 0.587, 0.114)));
    if (lum > 1.0) {
        out_color = vec4(color, 1.0);
    } else {
        out_color = vec4(0.0, 0.0, 0.0, 1.0);
    }
}