#!venv/bin/python
import mapnik

stylesheet = 'world_style.xml'
image = 'output.png'
mapnik.register_fonts('/Library/Fonts/');

#for face in mapnik.FontEngine.face_names(): print face

m = mapnik.Map(1490, 720)
mapnik.load_map(m, stylesheet)
m.zoom_all()
#m.pan_and_zoom(1000, 400, 0.4)
mapnik.render_to_file(m, image)
print "rendered image to '%s'" % image
