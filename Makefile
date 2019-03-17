.PHONY: slides
.SILENT: build

alias: ## alias to esilv-castle.now.sh
	now alias $(filter-out $@,$(MAKECMDGOALS)) esilv-denzel

deploy: ## build and deploy reveal slides
	reveal-md slides/WORKSHOP.md --css slides/reveal.css --template slides/reveal.html --static dist
	now --public dist -n esilv

slides: ## start reveal on localhost
	reveal-md slides/WORKSHOP.md --css slides/reveal.css --template slides/reveal.html -w

help: ## This help dialog.
	@IFS=$$'\n' ; \
  help_lines=(`fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##/:/'`); \
  printf "%-20s %s\n" "target" "help" ; \
  printf "%-20s %s\n" "------" "----" ; \
  for help_line in $${help_lines[@]}; do \
      IFS=$$':' ; \
      help_split=($$help_line) ; \
      help_command=`echo $${help_split[0]} | sed -e 's/^ *//' -e 's/ *$$//'` ; \
      help_info=`echo $${help_split[2]} | sed -e 's/^ *//' -e 's/ *$$//'` ; \
      printf '\033[36m'; \
      printf "%-20s %s" $$help_command ; \
      printf '\033[0m'; \
      printf "%s\n" $$help_info; \
  done
.DEFAULT_GOAL := help
