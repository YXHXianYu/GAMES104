#version 310 es

#extension GL_GOOGLE_include_directive : enable

#include "constants.h"

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_color;

layout(location = 0) out highp vec4 out_color;

void main()
{
    highp vec3 color = subpassLoad(in_color).rgb;

    out_color = vec4(color, 1.0f);
}