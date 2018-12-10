.PHONY: map
map: map/venv
	map/venv/bin/python map/run.py && cp map/output.svg webapp/assets/world_bg.svg

map/venv: map/requirements.txt
	virtualenv --python=python2.7 map/venv
	map/venv/bin/pip install -r map/requirements.txt

.PHONY: data
data: data/venv
	data/venv/bin/python data/sheet_import.py
	cat data/locations.html | pbcopy
	@echo "Location table copied to clipboard."

data/venv: data/requirements.txt
	virtualenv --python=python3 data/venv
	data/venv/bin/pip install -r data/requirements.txt

.PHONY: clean
clean:
	rm -rf map/venv/ data/venv/
