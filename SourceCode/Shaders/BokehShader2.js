/**
 * @author zz85 / https://github.com/zz85 | twitter.com/blurspline
 *
 * Depth-of-field shader with bokeh
 * ported from GLSL shader by Martins Upitis
 * http://blenderartists.org/forum/showthread.php?237488-GLSL-depth-of-field-with-bokeh-v2-4-(update)
 *
 * Requires #define RINGS and SAMPLES integers
 */



THREE.BokehShader2 = {

	uniforms: {

		"textureWidth":  { type: "f", value: 1.0 },
		"textureHeight":  { type: "f", value: 1.0 },

		"focalDepth":   { type: "f", value: 1.0 },
		"focalLength":   { type: "f", value: 24.0 },
		"aperture": { type: "f", value: 0.9 },
		"CoC": {type: "f", value: 0.03},

		"tColor":   { type: "t", value: null },
		"tDepth":   { type: "t", value: null },

		"maxblur":  { type: "f", value: 1.0 },

		"showFocus":   { type: "i", value: 0 },
		"manualdof":   { type: "i", value: 0 },
		"vignetting":   { type: "i", value: 0 },
		"depthblur":   { type: "i", value: 0 },

		"threshold":  { type: "f", value: 0.5 },
		"gain":  { type: "f", value: 2.0 },
		"bias":  { type: "f", value: 0.5 },
		"fringe":  { type: "f", value: 0.7 },

		"znear":  { type: "f", value: 0.1 },
		"zfar":  { type: "f", value: 100 },

		"noise":  { type: "i", value: 1 },
		"dithering":  { type: "f", value: 0.0001 },
		"pentagon": { type: "i", value: 0 },

		"shaderFocus":  { type: "i", value: 1 },
		"focusCoords":  { type: "v2", value: new THREE.Vector2() },

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
		"#define SAMPLES 4",
		"#define RINGS 3",

		"varying vec2 vUv;",

		"uniform sampler2D tColor;",
		"uniform sampler2D tDepth;",
		"uniform float textureWidth;",
		"uniform float textureHeight;",

		"const float PI = 3.14159265;",

		"float width = textureWidth;",
		"float height = textureHeight;",

		"vec2 texel = vec2(1.0/width,1.0/height);",


		"uniform float focalDepth;  //focal distance value in meters, but you may use autofocus option below",
		"uniform float focalLength; //focal length in mm",
		"uniform float aperture; //f-stop value",
		"uniform bool showFocus; //show debug focus point and focal range (red = focal point, green = focal range)",


		/*
		make sure that these two values are the same for your camera, otherwise distances will be wrong.
		*/

		// camera clipping start
		"uniform float znear;",
		// camera clipping end
		"uniform float zfar;",

		//------------------------------------------
		//user variables

		//samples on the first ring
		"const int samples = SAMPLES;",
		// ring count
		"const int rings = RINGS;",

		"const int maxringsamples = rings * samples;",

		// manual dof calculation
		"uniform bool manualdof;",
		// near dof blur start
		"float ndofstart = 1.0;",
		// near dof blur falloff distance
		"float ndofdist = 2.0;",
		// far dof blur start
		"float fdofstart = 1.0;",
		// far dof blur falloff distance
		"float fdofdist = 3.0;",

		// circle of confusion size in mm (35mm film = 0.03mm)
		"uniform float CoC;",

		// use optical lens vignetting
		"uniform bool vignetting;",

		// vignetting outer border
		"float vignout = 1.3;",
		// vignetting inner border
		"float vignin = 0.0;",
		// f-stops till vignete fades
		"float vignfade = 22.0;",

		"uniform bool shaderFocus;",

		"bool autofocus = shaderFocus;",
		// use autofocus in shader - use with focusCoords
		// disable if you use external focalDepth value

		"uniform vec2 focusCoords;",
		// autofocus point on screen (0.0,0.0 - left lower corner, 1.0,1.0 - upper right)
		// if center of screen use vec2(0.5, 0.5)

		"uniform float maxblur;",
		//clamp value of max blur (0.0 = no blur, 1.0 default)

		// highlight threshold
		"uniform float threshold;",
		// highlight gain
		"uniform float gain;",

		// bokeh edge bias
		"uniform float bias;",

		// bokeh chromatic aberration / fringing
		"uniform float fringe;",

		// use noise instead of pattern for sample dithering
		"uniform bool noise;",

		"uniform float dithering;",
		//dither amount
		"float namount = dithering;",

		// blur the depth buffer
		"uniform bool depthblur;",
		// depth blur size
		"float dbsize = 1.25;",

		/*
		next part is experimental
		not looking good with small sample and ring count
		looks okay starting from samples = 4, rings = 4
		*/

		//use pentagon as bokeh shape?
		"uniform bool pentagon;",
		//pentagon shape feather
		"float feather = 0.4;",

		//------------------------------------------

		"float penta(vec2 coords) {",
			//pentagonal shape
			"float scale = float(rings) - 1.3;",
			"vec4  HS0 = vec4( 1.0,         0.0,         0.0,  1.0);",
			"vec4  HS1 = vec4( 0.309016994, 0.951056516, 0.0,  1.0);",
			"vec4  HS2 = vec4(-0.809016994, 0.587785252, 0.0,  1.0);",
			"vec4  HS3 = vec4(-0.809016994,-0.587785252, 0.0,  1.0);",
			"vec4  HS4 = vec4( 0.309016994,-0.951056516, 0.0,  1.0);",
			"vec4  HS5 = vec4( 0.0        ,0.0         , 1.0,  1.0);",

			"vec4  one = vec4( 1.0 );",

			"vec4 P = vec4((coords),vec2(scale, scale));",

			"vec4 dist = vec4(0.0);",
			"float inorout = -4.0;",

			"dist.x = dot( P, HS0 );",
			"dist.y = dot( P, HS1 );",
			"dist.z = dot( P, HS2 );",
			"dist.w = dot( P, HS3 );",

			"dist = smoothstep( -feather, feather, dist );",

			"inorout += dot( dist, one );",

			"dist.x = dot( P, HS4 );",
			"dist.y = HS5.w - abs( P.z );",

			"dist = smoothstep( -feather, feather, dist );",
			"inorout += dist.x;",

			"return clamp( inorout, 0.0, 1.0 );",
		"}",

		"float bdepth(vec2 coords) {",
			// Depth buffer blur
			"float d = 0.0;",
			"float kernel[9];",
			"vec2 offset[9];",

			"vec2 wh = vec2(texel.x, texel.y) * dbsize;",

			"offset[0] = vec2(-wh.x,-wh.y);",
			"offset[1] = vec2( 0.0, -wh.y);",
			"offset[2] = vec2( wh.x -wh.y);",

			"offset[3] = vec2(-wh.x,  0.0);",
			"offset[4] = vec2( 0.0,   0.0);",
			"offset[5] = vec2( wh.x,  0.0);",

			"offset[6] = vec2(-wh.x, wh.y);",
			"offset[7] = vec2( 0.0,  wh.y);",
			"offset[8] = vec2( wh.x, wh.y);",

			"kernel[0] = 1.0/16.0;   kernel[1] = 2.0/16.0;   kernel[2] = 1.0/16.0;",
			"kernel[3] = 2.0/16.0;   kernel[4] = 4.0/16.0;   kernel[5] = 2.0/16.0;",
			"kernel[6] = 1.0/16.0;   kernel[7] = 2.0/16.0;   kernel[8] = 1.0/16.0;",


			"for( int i=0; i<9; i++ ) {",
				"float tmp = texture2D(tDepth, coords + offset[i]).r;",
				"d += tmp * kernel[i];",
			"}",

			"return d;",
		"}",


		"vec3 color(vec2 coords,float blur) {",
			//processing the sample

			"vec3 col = vec3(0.0);",

			"col.r = texture2D(tColor,coords + vec2(0.0,1.0)*texel*fringe*blur).r;",
			"col.g = texture2D(tColor,coords + vec2(-0.866,-0.5)*texel*fringe*blur).g;",
			"col.b = texture2D(tColor,coords + vec2(0.866,-0.5)*texel*fringe*blur).b;",

			"vec3 lumcoeff = vec3(0.299,0.587,0.114);",
			"float lum = dot(col.rgb, lumcoeff);",
			"float thresh = max((lum-threshold)*gain, 0.0);",
			"return col+mix(vec3(0.0),col,thresh*blur);",
		"}",

		"vec2 rand(vec2 coord) {",
			// generating noise / pattern texture for dithering

			"float noiseX = ((fract(1.0-coord.s*(width/2.0))*0.25)+(fract(coord.t*(height/2.0))*0.75))*2.0-1.0;",
			"float noiseY = ((fract(1.0-coord.s*(width/2.0))*0.75)+(fract(coord.t*(height/2.0))*0.25))*2.0-1.0;",

			"if (noise) {",
				"noiseX = clamp(fract(sin(dot(coord ,vec2(12.9898,78.233))) * 43758.5453),0.0,1.0)*2.0-1.0;",
				"noiseY = clamp(fract(sin(dot(coord ,vec2(12.9898,78.233)*2.0)) * 43758.5453),0.0,1.0)*2.0-1.0;",
			"}",

			"return vec2(noiseX,noiseY);",
		"}",

		"vec3 debugFocus(vec3 col, float blur, float depth) {",
			//distance based edge smoothing
			"float edge = 0.002*depth;", 

			"float m = clamp(smoothstep(0.0, edge, blur), 0.0, 1.0);",
			"float e = clamp(smoothstep(1.0 - edge, 1.0, blur), 0.0, 1.0);",

			"col = mix(col, vec3(1.0, 0.5, 0.0), (1.0-m) * 0.6);",
			"col = mix(col, vec3(0.0, 0.5, 1.0), ((1.0-e)-(1.0-m)) * 0.2);",

			"return col;",
		"}",

		"float linearize(float depth) {",
			"return -zfar * znear / (depth * (zfar - znear) - zfar);",
		"}",

		"float rSmoothstep(float color) {",
			"color = clamp(color, 0.0, 1.0);",
			"float rColor = 1.0 - color;",

			"float y = rColor;",
			"float x = 0.0;",
			"if (y < 1.0 / 3.0) {",
				"x = sqrt(y / 3.0);",
			"} else if (y < 2.0 / 3.0) {",
				"x = 1.0 / 2.0 + (2.0 * y - 1.0) / 3.0;",
			"} else {",
				"x = 1.0 - sqrt((1.0 - y) / 3.0);",
			"}",

			// http://math.stackexchange.com/questions/1342833/how-do-i-reverse-the-smooth-step-equation
			// https://en.wikipedia.org/wiki/Newton%27s_method

			// Newton–Raphson method
			"float yx = x * x * (3.0 - 2.0 * x);",
			// abs(yx - y) > 0.001
			"for (int i = 0; i < 3; i++) {",
				"x = x - (yx - y) / (6.0 * x - 6.0 * x * x);",
				"yx = x * x * (3.0 - 2.0 * x);",
			"}",
			"return znear + (zfar - znear) * x;",
		"}",

		"float vignette() {",
			"float dist = distance(vUv.xy, vec2(0.5,0.5));",
			"dist = smoothstep(vignout+(aperture/vignfade), vignin+(aperture/vignfade), dist);",
			"return clamp(dist,0.0,1.0);",
		"}",

		"float gather(float i, float j, int ringsamples, inout vec3 col, float w, float h, float blur) {",
			"float rings2 = float(rings);",
			"float step = PI*2.0 / float(ringsamples);",
			"float pw = cos(j*step)*i;",
			"float ph = sin(j*step)*i;",
			"float p = 1.0;",
			"if (pentagon) {",
				"p = penta(vec2(pw,ph));",
			"}",
			"col += color(vUv.xy + vec2(pw*w,ph*h), blur) * mix(1.0, i/rings2, bias) * p;",
			"return 1.0 * mix(1.0, i /rings2, bias) * p;",
		"}",

// mark - 

		"void main() {",
			//scene depth calculation
			// "float depth = linearize(texture2D(tDepth,vUv.xy).x);",
			"float depth = rSmoothstep(texture2D(tDepth,vUv.xy).x);",

			// blur depth
			// "if (depthblur) {",
			// 	"depth = linearize(bdepth(vUv.xy));",
			// "}",

			//focal plane calculation

			// "float fDepth = focalDepth;",
			// "float fDepth = linearize(1.0 - smoothstep(znear, zfar, focalDepth));",
			"float fDepth = rSmoothstep(1.0 - smoothstep(znear, zfar, focalDepth));",
			// "if (autofocus) {",
			// 	"fDepth = linearize(texture2D(tDepth,focusCoords).x);",
			// "}",

			// dof blur factor calculation

			"float blur = 0.0;",
			"if (manualdof) {",
				"float a = depth-fDepth;", // Focal plane
				"float b = (a-fdofstart)/fdofdist;", // Far DoF
				"float c = (-a-ndofstart)/ndofdist;", // Near Dof
				"blur = (a>0.0) ? b : c;",
			"} else {",

				"float focalL = focalLength;", // focal length in mm

				"float focalD = fDepth * 1000.0;", // focal plane in mm
				"float objectD = depth * 1000.0;", // depth in mm

				"float a = (objectD * focalL) / (objectD - focalL);",
				"float b = (focalD * focalL) / (focalD - focalL);",
				
				"float c = (focalD - focalL) / (focalD * aperture * CoC);",
				"blur = abs(a-b) * c;",

				// h=(F*F)/(f*c);
				// dofNear=(h*D)/(h+(D-F)); 
				// dofFar=(h*D)/(h-(D-F)); 

				// "float f = focalLength;",
				// "float d = linearize(smoothstep(znear, zfar, focalDepth)) * 1000.0;",
				// "float o = linearize(1.0 - texture2D(tDepth,vUv.xy).x) * 1000.0;",
				
				// "float h = (f*f)/(fstop*43.0);",
				// "float dofNear = (h*d)/(h+(d-f)); ;",
				// "float dofFar = (h*d)/(h-(d-f));",
				// "if (o > dofFar) {",
				// 	"blur = clamp((o - dofFar) / (zfar - dofFar), 0.0, 1.0);;",
				// "} else if (o < dofNear) {",
				// 	"blur = clamp((o - znear) / (dofNear - znear), 0.0, 1.0);;",
				// "} else {",
				// 	"blur = 1.0;",
				// "}",

			"}",

			"blur = clamp(blur,0.0,1.0);",

			// calculation of pattern for dithering"
			"vec2 noise = rand(vUv.xy) * namount * blur;",

			// getting blur x and y step factor"
			"float w = (1.0/width) * blur * maxblur + noise.x;",
			"float h = (1.0/height) * blur * maxblur + noise.y;",

			// calculation of final color"
			"vec3 col = vec3(0.0);",
			"if(blur < 0.0) {",
				//some optimization thingy"
				"col = texture2D(tColor, vUv.xy).rgb;",
			"} else {",
				"col = texture2D(tColor, vUv.xy).rgb;",
				"float s = 1.0;",
				"int ringsamples;",

				"for (int i = 1; i <= rings; i++) {",
					/*unboxstart*/
					"ringsamples = i * samples;",

					"for (int j = 0; j < maxringsamples ; j++) {",
						"if (j >= ringsamples) break;",
						"s += gather(float(i), float(j), ringsamples, col, w, h, blur);",
					"}",
					/*unboxend*/
				"}",
				//divide by sample count
				"col /= s;",
			"}",

			"if (showFocus) {",
				"col = debugFocus(col, blur, depth);",
			"}",

			"if (vignetting) {",
				"col *= vignette();",
			"}",

			"gl_FragColor.rgb = col;",
			"gl_FragColor.a = 1.0;",
		"} "

	].join("\n")

};
