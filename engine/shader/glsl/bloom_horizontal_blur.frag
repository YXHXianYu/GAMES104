#version 310 es

#extension GL_GOOGLE_include_directive : enable

#include "constants.h"

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_color;
// layout(set = 0, binding = 0) uniform highp sampler2D in_color;

layout(location = 0) in highp vec2 in_texcoord;

layout(location = 0) out highp vec4 out_color;

void main()
{
    highp vec3 color = subpassLoad(in_color).rgb;
    // highp vec3 color = texture(in_color, in_texcoord).rgb;
    
    out_color = vec4(color, 1.0);
}