from otree.api import (
    models, widgets, BaseSubsession, BaseGroup, BasePlayer,
    Currency as c, currency_range
)
import random

from .config import Constants

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
    pass


# ******************************************************************************************************************** #
# *** CLASS PLAYER *** #
# ******************************************************************************************************************** #
class Player(BasePlayer):

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
            self.participant.vars['round_to_pay'] = random.randint(1,Constants.num_rounds)

        # determine round_result as (potential) payoff per round
        if self.bomb == 0:
            self.round_result = c(self.boxes_collected * Constants.box_value)
        else:
            self.round_result = c(0)

        # set payoffs if <random_payoff = True> to round_result of randomly chosen round
        if Constants.random_payoff == True:
            if self.subsession.round_number == self.participant.vars['round_to_pay']:
                self.payoff = self.round_result
            else:
                self.payoff = c(0)

        # set payoffs to round_result if <random_payoff = False>
        else:
            self.payoff = self.round_result
