/**
 * @author andrewberg / http://andrewberg.com/
 *
 * Depth of Field
 * - ported from
 */

THREE.DoFShader = {

	uniforms: {

		"tDiffuse":     { type: "t", value: null },
		"tDepth":       { type: "t", value: null },
		"size":         { type: "v2", value: new THREE.Vector2(512, 512) },
		"textel":		{ type: "v2", value: new THREE.Vector2(1/512, 1/512)},
		"znear":		{ type: "f", value: 1.0 },
		"zfar":			{ type: "f", value: 1000.0 },
		"showFocus":	{ type: "i", value: 0 },
		"focalDepth":	{ type: "f", value: 60.0 },
		"focalLength":	{ type: "f", value: 35.0 },
		"aperture":		{ type: "f", value: 2.8 },	
		"autofocus":	{ type: "i", value: 1 },
		"focus":        { type: "v2", value: new THREE.Vector2(0.5, 0.5) },
		"maxblur":		{ type: "f", value: 1.0 },
		"manualdof":	{ type: "i", value: 0 },
		"ndofstart":	{ type: "f", value: 1.0 },
		"ndofdist":		{ type: "f", value: 2.0 },
		"fdofstart":	{ type: "f", value: 1.0 },
		"fdofdist":		{ type: "f", value: 3.0 },
		"coc":			{ type: "f", value: 0.03 },
		"vignetting":	{ type: "i", value: 1 },
		"vignout":		{ type: "f", value: 1.3 },
		"vignin":		{ type: "f", value: 0.0 },
		"vignfade":		{ type: "f", value: 22.0 },
		"threshold":	{ type: "f", value: 0.8 },
		"gain":			{ type: "f", value: 1.7 },
		"bias":			{ type: "f", value: 0.5 },
		"fringe":		{ type: "f", value: 0.7 },
		"noise":		{ type: "i", value: 1 },
		"namount":		{ type: "f", value: 0.0001 },
		"depthblur":	{ type: "i", value: 0 },
		"dbsize":		{ type: "f", value: 1.25},
		"framesize": {type: "f", value: 35.00},
		"aspect": {type: "f", value: 1.33}
	},

	vertexShader: [

		"varying vec2 vUv;",
		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}"
	].join("\n"),

	fragmentShader: [

		"precision mediump float;",
		"#define PI  3.14159265",

// **********
		// variables	
		// {
		"varying vec2 vUv;",

		// uniform variables from external script
		"uniform sampler2D tDiffuse;",
		"uniform sampler2D tDepth;",
		"uniform vec2 size;", // texture width and height
		"uniform vec2 texel;", // textel size
		"uniform float focalDepth;",  //focal distance value in meters, but you may use autofocus option below
		"uniform float focalLength;", //focal length in mm
		"uniform float aperture;", //f-stop value
		"uniform bool showFocus;", //show debug focus point and focal range (orange = focal point, blue = focal range)
		//make sure that these two values are the same for your camera, otherwise distances will be wrong.
		"uniform float znear;", //camera clipping start
		"uniform float zfar;", //camera clipping end
		// user variables now passed as uniforms
		"uniform bool manualdof;", // manual dof calculation
		"uniform float ndofstart;", // near dof blur start
		"uniform float ndofdist;", // near dof blur falloff distance
		"uniform float fdofstart;", // far dof blur start
		"uniform float fdofdist;", // far dof blur falloff distance
		"uniform float coc;", // circle of confusion size in mm (35mm film = 0.03mm)
		"uniform bool vignetting;", // use optical lens vignetting
		"uniform float vignout;", // vignetting outer border
		"uniform float vignin;", // vignetting inner border
		"uniform float vignfade;", // f-stops till vignete fades
		"uniform bool autofocus;", //use autofocus in shader? disable if you use external focalDepth value
		"uniform vec2 focus;", // autofocus point on screen (0.0, 0.0 - left lower corner, 1.0, 1.0 - upper right)
		"uniform float maxblur;", //clamp value of max blur (0.0 = no blur,1.0 default)
		"uniform bool depthblur;", // blur the depth buffer
		"uniform float dbsize;", // depthblursize
		"uniform float threshold;", // highlight threshold;
		"uniform float gain;", // highlight gain;
		"uniform float bias;", // bokeh edge bias
		"uniform float fringe;", // bokeh chromatic aberration/fringing
		"uniform bool noise;", // use noise instead of pattern for sample dithering
		"uniform float namount;", // dither amount
		// samples and rings need to be constants. no dynamic loop counters in OpenGL ES
		// Can shader be broken into 2 pass? ... 
		"int samples = 3;", //samples on the first ring
		"const int rings = 3;", //ring count

		/*
		next part is experimental
		not looking good with small sample and ring count
		looks okay starting from samples = 4, rings = 4
		*/

		"bool pentagon = false;", // use pentagon as bokeh shape
		"float feather = 0.4;", // pentagon shape feather
		// }
// **********	


		// pentagonal shape
		// "float penta(vec2 coords) {", 
		// 	"float scale = float(rings) - 1.3;",
		// 	"vec4  HS0 = vec4( 1.0,         0.0,         0.0,  1.0);",
		// 	"vec4  HS1 = vec4( 0.309016994, 0.951056516, 0.0,  1.0);",
		// 	"vec4  HS2 = vec4(-0.809016994, 0.587785252, 0.0,  1.0);",
		// 	"vec4  HS3 = vec4(-0.809016994,-0.587785252, 0.0,  1.0);",
		// 	"vec4  HS4 = vec4( 0.309016994,-0.951056516, 0.0,  1.0);",
		// 	"vec4  HS5 = vec4( 0.0        ,0.0         , 1.0,  1.0);",

		// 	"vec4  one = vec4( 1.0 );",

		// 	"vec4 P = vec4((coords),vec2(scale, scale));",

		// 	"vec4 dist = vec4(0.0);",
		// 	"float inorout = -4.0;",

		// 	"dist.x = dot( P, HS0 );",
		// 	"dist.y = dot( P, HS1 );",
		// 	"dist.z = dot( P, HS2 );",
		// 	"dist.w = dot( P, HS3 );",

		// 	"dist = smoothstep( -feather, feather, dist );",

		// 	"inorout += dot( dist, one );",

		// 	"dist.x = dot( P, HS4 );",
		// 	"dist.y = HS5.w - abs( P.z );",

		// 	"dist = smoothstep( -feather, feather, dist );",
		// 	"inorout += dist.x;",

		// 	"return clamp(inorout, 0.0, 1.0);",
		// "}",

		// "float vignette() {",
		
		// 	"float dist = distance(vUv, vec2(0.5, 0.5));",
		// 	"dist = smoothstep(vignout + (fstop/vignfade), vignin + (fstop / vignfade), dist);",

		// 	"return clamp(dist,0.0,1.0);",
		// "}",


// **********
		// RGBA depth	
		"float unpackDepth(const in vec4 rgba_depth) {",
			"const vec4 bit_shift = vec4(1.0 / (256.0 * 256.0 * 256.0), 1.0 / (256.0 * 256.0), 1.0 / 256.0, 1.0);",
			"float depth = dot(rgba_depth, bit_shift);",

			"return depth;",
		"}",

		// blurring depth
		// "float bdepth(vec2 coords) {",

		// 	"float d = 0.0;",
		// 	"float kernel[9];",
		// 	"vec2 offset[9];",

		// 	"vec2 wh = vec2(texel.x, texel.y) * dbsize;",

		// 	"offset[0] = vec2(-wh.x,-wh.y);",
		// 	"offset[1] = vec2( 0.0, -wh.y);",
		// 	"offset[2] = vec2( wh.x -wh.y);",

		// 	"offset[3] = vec2(-wh.x,  0.0);",
		// 	"offset[4] = vec2( 0.0,   0.0);",
		// 	"offset[5] = vec2( wh.x,  0.0);",

		// 	"offset[6] = vec2(-wh.x, wh.y);",
		// 	"offset[7] = vec2( 0.0,  wh.y);",
		// 	"offset[8] = vec2( wh.x, wh.y);",

		// 	"kernel[0] = 1.0/16.0;   kernel[1] = 2.0/16.0;   kernel[2] = 1.0/16.0;",
		// 	"kernel[3] = 2.0/16.0;   kernel[4] = 4.0/16.0;   kernel[5] = 2.0/16.0;",
		// 	"kernel[6] = 1.0/16.0;   kernel[7] = 2.0/16.0;   kernel[8] = 1.0/16.0;",

		// 	"for(int i = 0; i < 9; ++i) {",

		// 		"float tmp = unpackDepth(texture2D(tDepth, coords + offset[i]));",
		// 		"d += tmp * kernel[i];",
		// 	"}",

		// 	"return d;",
		// "}",

		// processing the sample
		"vec3 color(vec2 coords, float blur) {", 
			"vec3 col = vec3(0.0);",

			"col.r = texture2D(tDiffuse, coords + vec2(0.0, 1.0) * texel * fringe * blur).r;",
			"col.g = texture2D(tDiffuse, coords + vec2(-0.866, -0.5) * texel * fringe * blur).g;",
			"col.b = texture2D(tDiffuse, coords + vec2(0.866, -0.5) * texel * fringe * blur).b;",

			"vec3 lumcoeff = vec3(0.299, 0.587, 0.114);",
			"float lum = dot(col.rgb, lumcoeff);",
			"float thresh = max((lum - threshold) * gain, 0.0);",

			"return col + mix(vec3(0.0), col, thresh * blur);",
		"}",

		"vec3 debugFocus(vec3 col, float blur, float depth) {",
			// distance based edge smoothing
			"float edge = 0.002 * depth;",
			"float m = clamp(smoothstep(0.0, edge, blur), 0.0, 1.0);",
			"float e = clamp(smoothstep(1.0 - edge, 1.0, blur), 0.0, 1.0);",

			"col = mix(col, vec3(1.0, 0.5, 0.0), (1.0 - m) * 0.6);",
			"col = mix(col, vec3(0.0, 0.5, 1.0), ((1.0 - e) - (1.0 - m)) * 0.2);",

			"return col;",
		"}",
// **********		


		// generating noise/pattern texture for dithering
		"vec2 rand(vec2 coord) {",
			"float noiseX = ((fract(1.0 - coord.s * (size.x / 2.0)) * 0.25) + (fract(coord.t * (size.y / 2.0)) * 0.75)) * 2.0 - 1.0;",
			"float noiseY = ((fract(1.0 - coord.s * (size.x / 2.0)) * 0.75) + (fract(coord.t * (size.y / 2.0)) * 0.25)) * 2.0 - 1.0;",

			"if (noise) {",
				"noiseX = clamp(fract(sin(dot(coord, vec2(12.9898, 78.233))) * 43758.5453), 0.0, 1.0) * 2.0 - 1.0;",
				"noiseY = clamp(fract(sin(dot(coord, vec2(12.9898, 78.233) * 2.0)) * 43758.5453), 0.0, 1.0) * 2.0 - 1.0;",
			"}",

			"return vec2(noiseX,noiseY);",
		"}",


// **********
		"float linearize(float depth) {",
			"return zfar * znear / (zfar - depth * (zfar - znear));",
		"}",

		"void main() {",
			// scene depth calculation
			// {
			"float depth = linearize(unpackDepth(texture2D(tDepth, vUv)));",
			// "if (depthblur) {",
			// 		"depth = linearize(bdepth(vUv));",
			// "}",
			// }


			// focal plane calculation",
			// {
			"float fDepth = focalDepth;",
			"if (autofocus) {",
				"fDepth = linearize(unpackDepth(texture2D(tDepth, focus)));",
			"}",
			// }


			// DoF blur factor calculation
			// {
			"float blur = 0.0;",
			// "if (manualdof) {",
			// 	"float a = depth - fDepth;", // focal plane
			// 	"float b = (a - fdofstart) / fdofdist;", // far DoF
			// 	"float c = (-a - ndofstart) / ndofdist;", // near DoF

			// 	"blur = (a > 0.0) ? b : c;",
			// "} else {",
				"float f = 0.001 * focalLength;", 
				"float d = fDepth;",
				"float o = depth;",

				// "float a = (o * f) / (o - f);",
				// "float b = (d * f) / (d - f);",
				// "float c = (d - f) / (d * fstop * CoC);",
				// "blur = abs(a - b) * c;",

				"float a = abs(o - d);",
				"float c =  f * f / (aperture * (d - f));",
				"blur = c * a / o;",
			// "}",
			"blur = clamp(blur, 0.0, 1.0);",
			// }
// **********


// TODO:
			// calculation of pattern for dithering
			"vec2 noise = rand(vUv) * namount * blur;",

			// getting blur x and y step factor
			"float w = (1.0 / size.x) * blur * maxblur + noise.x;",
			"float h = (1.0 / size.y) * blur * maxblur + noise.y;",


// **********
			// final color calculation
			// {
			"vec3 col = texture2D(tDiffuse, vUv).rgb;",
			"if (blur > 0.05) {",
				"float s = 1.0;",
				"const int max_i = 9;",

				"for (int i = 0; i < rings; ++i) {",
					"float float_i = float(i + 1);",
					"float ringsamples = float_i * float(samples);",
					
			 		"for (int j = 0; j < max_i; ++j) {",
			 			"float float_j = float(j);",

						"float step = 2.0 * PI / ringsamples;",
						"float pw = float_i * cos(float_j * step);",
						"float ph = float_i * sin(float_j * step);",
						
						"float p = 1.0;",
						// "if (pentagon) {",
						
						// 	"p = penta(vec2(pw, ph));",
						// "}",

						"float m = p * mix(1.0, float_i / float(rings), bias);",
						"col += m * color(vUv + vec2(pw * w, ph * h), blur);",
						"s += m;",

						"if (j == 3 * (i + 1)) {",
							"break;",
						"}", 
					"}",
				"}",

				//divide by sample count
				"col /= s;", 
			"}",
			// }
// **********


			"if (showFocus) {",
				"col = debugFocus(col, blur, depth);",
			"}",


			// "if (vignetting) {",
			// 	"col *= vignette();",
			// "}",


			"gl_FragColor.rgb = col;",
			"gl_FragColor.a = 1.0;",
		"}"
	].join("\n")

};
