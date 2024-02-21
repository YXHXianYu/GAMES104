# YXH_XianYu's Color Grading

## 1. Result

### 1.1 Color Grading with Default LUT

* Origin Image
  * ![image-20240221171527475](./README/image-20240221171527475.png)
  
* `color_grading_LUT.jpg`
  * ![lut0](./engine/asset/texture/lut/color_grading_LUT.jpg)
  * ![image-20240221171232049](./README/image-20240221171232049.png)

* `color_grading_lut_01.png`

  * ![lut1](./engine/asset/texture/lut/color_grading_lut_01.png)
  * ![image-20240221171445551](./README/image-20240221171445551.png)

* `color_grading_lut_02.png`

  * ![lut1](./engine/asset/texture/lut/color_grading_lut_02.png)
  * ![image-20240221171609948](./README/image-20240221171609948.png)

* `color_grading_lut_03.png`

  * ![lut1](./engine/asset/texture/lut/color_grading_lut_03.png)
  * ![image-20240221171709795](./README/image-20240221171709795.png)

* `color_grading_lut_04.png`

  * ![lut1](./engine/asset/texture/lut/color_grading_lut_04.png)
  * ![image-20240221171849462](./README/image-20240221171849462.png)

* `color_grading_lut_05.png`

  * ![lut1](./engine/asset/texture/lut/color_grading_lut_05.png)
  * ![image-20240221171915919](./README/image-20240221171915919.png)

* `color_grading_lut_06.png`

  * ![lut1](./engine/asset/texture/lut/color_grading_lut_06.png)
  * ![image-20240221171940894](./README/image-20240221171940894.png)

### 1.2 Color Grading with my LUT

* LUT effect is as follows

  * ![image-20240221172812148](./README/image-20240221172812148.png)![image-20240221172821021](./README/image-20240221172821021.png)
  * Hoshino is tired from work and wants to do something bad

    > “红温了”

* LUT

  * ![yxhxianyu-lut-1x64-64x4096](./README/yxhxianyu-lut-1x64-64x4096.png)

* Result

  * ![image-20240221174814770](./README/image-20240221174814770.png)

### 1.3 (Improvement) New Render Pass

* TODO

## 2. My Code

```glsl
const highp float EPS = 0.0001;
const highp float LUT_COLOR = 16.0; // 32.0 or 64.0

void main()
{
    highp ivec2 lut_tex_size = textureSize(color_grading_lut_texture_sampler, 0);
    highp float _COLORS      = float(lut_tex_size.y);

    highp vec4 color       = subpassLoad(in_color).rgba;
    
	/* Here is my answer (begin) */
    highp float b1 = min(1.0 - EPS, color.b) * LUT_COLOR;

    highp float u1 = floor(b1) / LUT_COLOR + color.r / LUT_COLOR;
    highp float u2 = ceil(b1) / LUT_COLOR + color.r / LUT_COLOR;
    highp float v = color.g;

    highp vec4 color1 = texture(color_grading_lut_texture_sampler, vec2(u1, v));
    highp vec4 color2 = texture(color_grading_lut_texture_sampler, vec2(u2, v));
    highp vec4 lut_color = mix(color1, color2, b1 - floor(b1));
	/* Here is my answer (end) */
    
    out_color = lut_color;
}
```

