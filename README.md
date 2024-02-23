# YXH_XianYu's Color Grading

## 1. Color Grading with Default LUT

### 1.1 Result

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

### 1.2 My Code

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

## 2 Color Grading with my LUT

* LUT effect is as follows

  * ![image-20240221172812148](./README/image-20240221172812148.png)![image-20240221172821021](./README/image-20240221172821021.png)
  * Hoshino is tired from work and wants to do something bad

    > “红温了”

* LUT

  * ![yxhxianyu-lut-1x64-64x4096](./README/yxhxianyu-lut-1x64-64x4096.png)

* Result

  * ![image-20240221174814770](./README/image-20240221174814770.png)

## 3. (Improvement) New Render Pass

### 3.1 目标

* 给Piccolo Engine添加Bloom效果

### 3.2 设计与修改思路

* Render Pipeline
  * Bloom应该位于Tone Mapping之前，对HDR空间的图像进行操作
* Buffer
  * Bloom Pass共涉及5个ImageBuffer，分别设为A，B，C，D，E
  * A为原始图像
  * B为亮度提取后的图像（依赖于A）
    * 通过一个亮度阈值，只保留其中明亮部分
  * C为水平模糊后的图像（依赖于B）
  * D为竖直模糊后的图像（依赖于C）
  * E为Bloom最终图像（依赖于A和D）
* 为了记录并且便于我自己的Debug，我接下来将分步骤来描述我如何实现的Bloom效果。每步修改完毕后，引擎都应该可以正常运行。

#### 3.2.1 添加并配置Buffer

* 因为在处理过程中，我们总共需要使用3个缓存Buffer（2个输入与1个输出），而Piccolo只提供了2个缓存Buffer（`backup_buffer_odd` 和 `backup_buffer_even`），所以我们需要新添加一个Buffer

* 在 `vulkan_passes.h` 中进行以下修改

  * line82，添加Buffer枚举量

    `_main_camera_pass_backup_buffer_third = 5`

* 在 `main_camera.h` 中进行以下修改

  * line51，配置Attachment Format
  * line142-152，配置VkAttachmentDescription
  * line2057，配置VkImageView
  * line2123，配置VkClearValue
  * line2241，配置VkClearValue

* 成功运行！！！

  * 太爽了

#### 3.2.2 添加并配置Bloom Subpass

* 根据ChatGPT，Vulkan中一个Subpass只能执行一次vertex shader与fragment shader，而我们的Bloom Effect需要4次Fragment Shader，所以就需要配置4个Subpass！
  * 是的，可以化简成3次，但这样就不符合单一职责原则了
* 4个Subpass分别为
  * _main_camera_subpass_bloom_brightness_extracting
  * _main_camera_subpass_bloom_horizontal_blur
  * _main_camera_subpass_bloom_vertical_blur
  * _main_camera_subpass_bloom_composite
* 在 `vulkan_passes.h` 中进行以下修改
  * line94-97，添加4个枚举量
* 在 `main_camera.h` 中进行以下修改
  * line249-345，配置4个Subpass
  * line349，将Tone Mapping Subpass的输入Buffer改为Bloom的输出Buffer
  * line426，将dependencies数组的大小从7改为11
  * line427...，将dependencies数组的计数方式改为自增，这样便于修改，但要注意下标越界问题
  * line464-523，配置VkSubpassDependency
  * line526，修改Tone Mapping的Dependency Subpass
* 在 `vulkan_passes.h` 中添加BloomPass对应的4个类声明
* 创建BloomPass对应的4个着色器
  * 先创建着色器文件，但不做任何处理，着色器返回原始图像
  * 便于预编译与自动补全
  * 先预编译一遍，不然着色器头文件不会生成
* 添加BloomPass对应的4个源文件
  * 前三个Pass直接复制Tone Mapping的，然后修改一下着色器名称即可
    * 太丑陋了！需要提取公共部分（TODO）
  * 第四个Pass需要修改输入为两部分，对应修改
* 在 `main_camera` 中添加对这四个subpass的调用
  * `vulkan_passes.h` 的两个draw函数声明中添加对应的4个Pass
  * `main_camera.cpp` 的两个draw函数定义中添加对应的4个Pass
* 在 `vulkan_manager` 中对这四个subpass进行初始化
  * `vulkan_manager.h` 中定义这四个private成员变量
  * `vulkan_manager.cpp` 中，在两个draw函数调用处，分别添加这四个变量
* 在 `swapchain.cpp` 中，对这四个subpass进行update
* 在 `render_passes.cpp` 中，对这四个subpass进行initialize
* cmake好像有bug，清空build文件夹后，修了几个语法错误，编译就过了
  * 但是画面有问题
  * ![image-20240223003954779](./README/image-20240223003954779.png)

* Debug
  * bug1
    * ![image-20240223004310663](./README/image-20240223004310663.png)
  * bug2
    * ![image-20240223013406203](./README/image-20240223013406203.png)
    * 应该是11
* 终于！
  * ![image-20240223013631378](./README/image-20240223013631378.png)
* 但是发现，我新增的4个subpass根本对图像没有作用，继续debug
* bug3
  * ![image-20240223131944796](./README/image-20240223131944796.png)
  * 应该是third
* 

