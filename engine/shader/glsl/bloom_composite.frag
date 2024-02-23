#version 310 es

#extension GL_GOOGLE_include_directive : enable

#include "constants.h"

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_origin_color;

layout(input_attachment_index = 1, set = 0, binding = 1) uniform highp subpassInput in_blur_color;

layout(location = 0) out highp vec4 out_color;

void main()
{
    highp vec3 origin_color = subpassLoad(in_origin_color).rgb;
    highp vec3 blur_color = subpassLoad(in_blur_color).rgb;

    out_color = vec4(origin_color + blur_color, 1.0);
}