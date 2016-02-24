# -*- coding: utf-8 -*-
# <standard imports>
from __future__ import division

import random

import otree.models
from otree.db import models
from otree import widgets
from otree.common import Currency as c, currency_range, safe_json
from otree.constants import BaseConstants
from otree.models import BaseSubsession, BaseGroup, BasePlayer
from setup import *
# </standard imports>

author = 'Felix Holzmeister & Armin Pfurtscheller'

doc = """
Bomb Risk Elicitation Task (BRET) à la Crosetto/Filippin (2013), Journal of Risk and Uncertainty (47): 31-65.
"""


# ******************************************************************************************************************** #
# *** CLASS SUBSESSION *** #
# ******************************************************************************************************************** #
class Subsession(BaseSubsession):
    pass

# ******************************************************************************************************************** #
# *** CLASS GROUP *** #
# ******************************************************************************************************************** #
class Group(BaseGroup):
    # <built-in>
    subsession = models.ForeignKey(Subsession)
    # </built-in>


# ******************************************************************************************************************** #
# *** CLASS PLAYER *** #
# ******************************************************************************************************************** #
class Player(BasePlayer):
    # <built-in>
    subsession = models.ForeignKey(Subsession)
    group = models.ForeignKey(Group, null=True)
    # </built-in>

    # whether bomb is collected or not
    bomb = models.IntegerField()

    # location of bomb with row/col info
    bomb_location = models.TextField()

    # number of collected boxes
    boxes_collected = models.IntegerField()

    # set/scheme of collected boxes
    boxes_scheme = models.TextField()


    # --- set round results and player's payoff
    # ------------------------------------------------------------------------------------------------------------------
    round_to_pay = models.IntegerField()
    round_result = models.CurrencyField()

    def set_payoff(self):
        # randomly determine round to pay on player level
        if self.subsession.round_number == 1:
            self.session.vars['round_to_pay'] = random.randint(1,Constants.num_rounds)

        # determine round_result as (potential) payoff per round
        if self.bomb == 0:
            self.round_result = c(self.boxes_collected * Constants.box_value)
        else:
            self.round_result = c(0)

        # set payoffs if <random_payoff = True> to round_result of randomly chosen round
        if Constants.random_payoff == True:
            if self.subsession.round_number == self.session.vars['round_to_pay']:
                self.payoff = self.round_result
            else:
                self.payoff = c(0)

        # set payoffs to round_result if <random_payoff = False>
        else:
            self.payoff = self.round_result


    # --- store values as global variables for session-wide use
    # ------------------------------------------------------------------------------------------------------------------
    def set_globals(self):
        self.session.vars['bomb'] = [p.bomb for p in self.in_all_rounds()]
        self.session.vars['bomb_location'] = [p.bomb_location for p in self.in_all_rounds()]
        self.session.vars['boxes_collected'] = [p.boxes_collected for p in self.in_all_rounds()]
        self.session.vars['boxes_scheme'] = [p.boxes_scheme for p in self.in_all_rounds()]
        self.session.vars['round_result'] = [p.round_result for p in self.in_all_rounds()]
        self.session.vars['bret_payoff'] = [p.payoff for p in self.in_all_rounds()]
